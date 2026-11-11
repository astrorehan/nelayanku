"""Create an inactive INT8 candidate calibrated on training images only."""

import argparse
import hashlib
import json
import shutil
import tempfile
from pathlib import Path

import numpy as np
import onnx
from onnx import helper, numpy_helper
from onnxruntime.quantization import CalibrationDataReader, QuantFormat, QuantType, quantize_static
from PIL import Image

from .inference import FreshnessBundle
from .training_data import CropTensor


def quantize_largest_weight(source: Path, target: Path):
    """Compress one large Conv weight, leaving activation arithmetic in FP32."""
    model = onnx.load(source)
    initializers = {value.name: value for value in model.graph.initializer}
    candidates = [initializers[node.input[1]] for node in model.graph.node
                  if node.op_type == "Conv" and node.input[1] in initializers]
    original = max(candidates, key=lambda value: numpy_helper.to_array(value).nbytes)
    weights = numpy_helper.to_array(original)
    peaks = np.max(np.abs(weights).reshape(weights.shape[0], -1), axis=1)
    scales = np.where(peaks > 0, peaks / 127, 1).astype(np.float32)
    shape = (weights.shape[0],) + (1,) * (weights.ndim - 1)
    quantized = np.clip(np.rint(weights / scales.reshape(shape)), -127, 127).astype(np.int8)
    weight_name, scale_name, zero_name = (original.name + suffix for suffix in [".int8", ".scale", ".zero"])
    model.graph.initializer.remove(original)
    model.graph.initializer.extend([numpy_helper.from_array(quantized, weight_name),
                                   numpy_helper.from_array(scales, scale_name),
                                   numpy_helper.from_array(np.zeros_like(scales, dtype=np.int8), zero_name)])
    model.graph.node.insert(0, helper.make_node("DequantizeLinear", [weight_name, scale_name, zero_name],
                                               [original.name], axis=0, name=original.name + ".dequantize"))
    onnx.checker.check_model(model)
    onnx.save(model, target)


class TrainingCalibration(CalibrationDataReader):
    def __init__(self, rows, input_name):
        self.rows = iter(rows)
        self.input_name = input_name

    def get_next(self):
        row = next(self.rows, None)
        if row is None:
            return None
        with Image.open(row["prepared_path"]) as image:
            tensor = CropTensor()(image).unsqueeze(0).numpy()
        return {self.input_name: tensor}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--dataset", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--parts", choices=["eye", "gill"], nargs="+", default=["eye", "gill"])
    parser.add_argument("--weight-only", action="store_true", help="Compress the largest Conv weight and preserve FP32 activations")
    args = parser.parse_args()
    if args.output.exists():
        parser.error("Choose a new versioned output directory")
    bundle = FreshnessBundle(args.manifest)
    rows = json.loads((args.dataset / "manifest.json").read_text(encoding="utf-8"))
    manifest = bundle.manifest.model_dump(exclude_none=True)
    manifest["version"] += ("-int8w-" if args.weight_only else "-int8-") + "-".join(args.parts)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="quant-", dir=args.output.parent) as temporary:
        staging = Path(temporary) / "bundle"
        staging.mkdir()
        for part, spec in bundle.manifest.models.items():
            if part not in args.parts:
                shutil.copyfile(args.manifest.parent / spec.file, staging / spec.file)
                continue
            selected = []
            for label in spec.labels:
                selected.extend([row for row in rows if row["part"] == part and row["split"] == "train" and row["label"] == label][:20])
            if not selected:
                raise ValueError(f"Calibration data missing for {part}")
            session = bundle.sessions[part]
            target = staging / spec.file
            if args.weight_only:
                quantize_largest_weight(args.manifest.parent / spec.file, target)
            else:
                quantize_static(str(args.manifest.parent / spec.file), str(target),
                                TrainingCalibration(selected, session.get_inputs()[0].name),
                                quant_format=QuantFormat.QOperator, activation_type=QuantType.QUInt8,
                                weight_type=QuantType.QInt8, per_channel=True, op_types_to_quantize=["Conv", "Gemm", "MatMul"])
            manifest["models"][part]["sha256"] = hashlib.sha256(target.read_bytes()).hexdigest()
            manifest["models"][part]["supportedSpecies"] = []
        (staging / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
        FreshnessBundle(staging / "manifest.json")
        staging.rename(args.output)
    print(f"INT8 candidate created at {args.output}. Validate class metrics and WASM before adoption.")


if __name__ == "__main__":
    main()
