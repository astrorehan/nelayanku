"""Export trained classifiers into a checksummed, inactive ONNX bundle."""

import argparse
import hashlib
import json
import shutil
import tempfile
from pathlib import Path

import numpy as np
import onnxruntime as ort
from ultralytics import YOLO
from .training_data import CropTensor  # Resolve transforms in initial CLI checkpoints.


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--eye", type=Path, required=True)
    parser.add_argument("--gill", type=Path, required=True)
    parser.add_argument("--version", required=True)
    parser.add_argument("--output", type=Path, default=Path("ai_services/artifacts"))
    args = parser.parse_args()
    if args.output.exists():
        parser.error("Use a new bundle directory to preserve existing versions")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="bundle-", dir=args.output.parent) as temporary:
        staging = Path(temporary) / "bundle"
        staging.mkdir()
        models = {}
        for part in ("eye", "gill"):
            model = YOLO(str(getattr(args, part)))
            labels = [model.names[index] for index in range(len(model.names))]
            expected = {"very_fresh", "fresh", "not_fresh"} if part == "eye" else {"fresh", "not_fresh"}
            if len(labels) != len(expected) or set(labels) != expected:
                raise ValueError(f"Checkpoint has wrong labels for {part}")
            exported = Path(model.export(format="onnx", imgsz=224, batch=1, dynamic=False, simplify=False, opset=17))
            target = staging / f"{part}.onnx"
            shutil.copyfile(exported, target)
            session = ort.InferenceSession(str(target), providers=["CPUExecutionProvider"])
            values = session.run(None, {session.get_inputs()[0].name: np.zeros((1, 3, 224, 224), dtype=np.float32)})[0]
            if not np.isfinite(values).all() or (values < 0).any() or not np.isclose(values.sum(), 1, atol=1e-4):
                raise ValueError("Export does not produce the expected probabilities")
            models[part] = {"file": target.name, "sha256": hashlib.sha256(target.read_bytes()).hexdigest(),
                            "labels": labels, "supportedSpecies": [], "outputType": "probabilities",
                            "inputName": session.get_inputs()[0].name, "outputName": session.get_outputs()[0].name,
                            "confidenceThreshold": 0.8}
        manifest = {"version": args.version, "preprocessing": "rgb-bilinear-224-f32-nchw-v1", "models": models}
        (staging / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
        staging.rename(args.output)
    print("Export complete. Activate supportedSpecies only after independent evaluation and runtime parity checks.")


if __name__ == "__main__":
    main()
