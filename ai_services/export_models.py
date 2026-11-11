"""Export trained classifiers into a checksummed, inactive ONNX bundle."""

import argparse
import hashlib
import json
import shutil
from pathlib import Path

from ultralytics import YOLO


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--eye", type=Path, required=True)
    parser.add_argument("--gill", type=Path, required=True)
    parser.add_argument("--version", required=True)
    parser.add_argument("--output", type=Path, default=Path("ai_services/artifacts"))
    args = parser.parse_args()
    if args.output.exists():
        parser.error("Use a new bundle directory to preserve existing versions")
    args.output.mkdir(parents=True)
    models = {}
    for part in ("eye", "gill"):
        model = YOLO(str(getattr(args, part)))
        labels = [model.names[index] for index in range(len(model.names))]
        expected = {"very_fresh", "fresh", "not_fresh"} if part == "eye" else {"fresh", "not_fresh"}
        if set(labels) != expected:
            raise ValueError(f"Checkpoint has wrong labels for {part}")
        exported = Path(model.export(format="onnx", imgsz=224, batch=1, dynamic=False, simplify=False, opset=17))
        target = args.output / f"{part}.onnx"
        shutil.copyfile(exported, target)
        models[part] = {"file": target.name, "sha256": hashlib.sha256(target.read_bytes()).hexdigest(),
                        "labels": labels, "supportedSpecies": [], "outputType": "probabilities",
                        "confidenceThreshold": 0.8}
    manifest = {"version": args.version, "preprocessing": "rgb-bilinear-224-f32-nchw-v1", "models": models}
    (args.output / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print("Export complete. Activate supportedSpecies only after independent evaluation and runtime parity checks.")


if __name__ == "__main__":
    main()
