"""Train the optional detector after an independently annotated dataset is ready."""

import argparse
import csv
import math
from pathlib import Path

import yaml
from ultralytics import YOLO
from ultralytics.models.yolo.detect import DetectionTrainer
from ultralytics.data.utils import check_det_dataset, img2label_paths

from .training_csv import read_checkpoint_results_csv


class FreshnessDetectionTrainer(DetectionTrainer):
    def read_results_csv(self):
        return read_checkpoint_results_csv(self.csv)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data", type=Path, required=True, help="YOLO detection data.yaml")
    parser.add_argument("--identities", type=Path, required=True, help="CSV path,fish_id,split for annotated photos")
    parser.add_argument("--device", default="cpu")
    parser.add_argument("--epochs", type=int, default=50)
    parser.add_argument("--name", required=True)
    args = parser.parse_args()
    config = yaml.safe_load(args.data.read_text(encoding="utf-8"))
    names = config.get("names")
    if names != {0: "eye", 1: "gill"} and names != ["eye", "gill"]:
        parser.error("Detector class order must be eye, gill")
    groups = {}
    with args.identities.open(encoding="utf-8", newline="") as stream:
        rows = list(csv.DictReader(stream))
    if not rows:
        parser.error("Provide identity metadata for the annotated photos")
    for row in rows:
        if not row.get("fish_id") or row.get("split") not in {"train", "val", "test"} or not Path(row["path"]).is_file():
            parser.error("Annotated photo metadata is incomplete")
        previous = groups.setdefault(row["fish_id"], row["split"])
        if previous != row["split"]:
            parser.error("A fish identity appears in multiple splits")
    resolved = check_det_dataset(str(args.data.resolve()), autodownload=False)
    for split in ["train", "val", "test"]:
        location = resolved.get(split)
        if not isinstance(location, str) or not Path(location).is_dir():
            parser.error("Each detector split must point to an image directory")
        images = {p.resolve() for p in Path(location).rglob("*") if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}}
        declared = {Path(row["path"]).resolve() for row in rows if row["split"] == split}
        if not images or images != declared:
            parser.error(f"Identity CSV does not match the actual {split} image set")
        classes = set()
        for image in images:
            labels = Path(img2label_paths([str(image)])[0])
            if not labels.is_file():
                parser.error(f"Missing annotation file for {image.name}")
            for line in labels.read_text().splitlines():
                if not line.strip():
                    continue
                values = [float(value) for value in line.split()]
                if len(values) != 5 or not all(math.isfinite(value) for value in values):
                    parser.error(f"Invalid bounding box for {image.name}")
                category, x, y, width, height = values
                if category not in {0, 1} or width <= 0 or height <= 0 or min(x - width / 2, y - height / 2) < -1e-6 or max(x + width / 2, y + height / 2) > 1 + 1e-6:
                    parser.error(f"Bounding box outside the image or unknown class for {image.name}")
                classes.add(category)
        if classes != {0, 1}:
            parser.error(f"Both eye and gill annotations are required in {split}")
    YOLO("yolo11n.pt").train(trainer=FreshnessDetectionTrainer, data=str(args.data.resolve()), imgsz=640, batch=8, epochs=args.epochs,
                            device=args.device, seed=42, deterministic=True, workers=0,
                            project=str(Path("runs/freshness-detector").resolve()), name=args.name, exist_ok=False, patience=10, plots=False)


if __name__ == "__main__":
    main()
