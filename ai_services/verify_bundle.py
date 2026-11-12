"""Check PyTorch/ONNX parity and emit identical tensors for the WASM verifier."""

import argparse
import hashlib
import json
import time
from pathlib import Path

import numpy as np
import torch
from PIL import Image
from ultralytics import YOLO

from .inference import FreshnessBundle
from .training_data import CropTensor


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--eye", type=Path, required=True)
    parser.add_argument("--gill", type=Path, required=True)
    parser.add_argument("--dataset", type=Path, required=True)
    parser.add_argument("--report", type=Path, default=Path("ai_services/reports/onnx-parity.json"))
    parser.add_argument("--quantized", action="store_true", help="Record quantization drift instead of asserting FP32 same-graph parity")
    args = parser.parse_args()
    torch.set_num_threads(2)
    bundle = FreshnessBundle(args.manifest)
    entries = json.loads((args.dataset / "manifest.json").read_text(encoding="utf-8"))
    fixture_root = args.manifest.parent / "parity"
    fixture_root.mkdir(exist_ok=True)
    cases = []
    for part, spec in bundle.manifest.models.items():
        model = YOLO(str(getattr(args, part))).model.cpu().float().eval()
        session = bundle.sessions[part]
        for index, label in enumerate(spec.labels):
            row = next(row for row in entries if row["part"] == part and row["split"] == "train" and row["label"] == label)
            with Image.open(row["prepared_path"]) as image:
                tensor = CropTensor()(image).unsqueeze(0)
            with torch.inference_mode():
                output = model(tensor)
                expected = (output[0] if isinstance(output, tuple) else output).numpy()
            actual = session.run(None, {session.get_inputs()[0].name: tensor.numpy()})[0]
            error = float(np.abs(actual - expected).max())
            if error > 0.0001 and not args.quantized:
                raise ValueError(f"Runtime parity failed for {part}/{label}: {error}")
            file = f"{part}-{index}.tensor.bin"
            raw = tensor.numpy().astype("<f4").tobytes()
            (fixture_root / file).write_bytes(raw)
            times = []
            for _ in range(20):
                started = time.perf_counter()
                session.run(None, {session.get_inputs()[0].name: tensor.numpy()})
                times.append((time.perf_counter() - started) * 1000)
            cases.append({"part": part, "label": label, "file": file,
                          "tensorSha256": hashlib.sha256(raw).hexdigest(),
                          "probabilities": actual.reshape(-1).tolist(), "maxAbsoluteError": error,
                          "sameArgmaxAsFp32": bool(actual.argmax() == expected.argmax()),
                          "inferenceCpuP50Ms": float(np.percentile(times, 50)), "inferenceCpuP95Ms": float(np.percentile(times, 95))})
    fixtures = {"version": bundle.version, "cases": cases}
    (fixture_root / "fixtures.json").write_text(json.dumps(fixtures, indent=2), encoding="utf-8")
    report = {"version": bundle.version, "referenceComparison": "quantization drift" if args.quantized else "FP32 runtime parity",
              "cases": cases, "totalModelBytes": sum(
        (args.manifest.parent / spec.file).stat().st_size for spec in bundle.manifest.models.values()),
        "checkpoints": {part: hashlib.sha256(getattr(args, part).read_bytes()).hexdigest() for part in ["eye", "gill"]},
        "device": "CPU desktop; Android verification pending"}
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
