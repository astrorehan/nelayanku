"""Train a classifier with the same RGB tensor transform used by inference."""

import argparse
import json
from pathlib import Path

import cv2
import numpy as np
import torch
from PIL import Image
from ultralytics import YOLO
from ultralytics.models.yolo.classify import ClassificationTrainer

from ai_services.image_pipeline import image_tensor


class CropTensor:
    def __call__(self, image: Image.Image):
        rgb = np.asarray(image.convert("RGB"))
        height, width = rgb.shape[:2]
        side = min(height, width)
        rgb = rgb[(height - side) // 2:(height + side) // 2, (width - side) // 2:(width + side) // 2]
        return torch.from_numpy(image_tensor(cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR))[0])


class FreshnessTrainer(ClassificationTrainer):
    def build_dataset(self, img_path, mode="train", batch=None):
        dataset = super().build_dataset(img_path, mode, batch)
        # Dataset crop policy is fixed before splitting. Keep colour intact.
        dataset.torch_transforms = CropTensor()
        return dataset


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--part", choices=["eye", "gill"], required=True)
    parser.add_argument("--data", type=Path, required=True)
    parser.add_argument("--epochs", type=int, default=50)
    parser.add_argument("--batch", type=int, default=16)
    parser.add_argument("--device", default="cpu")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--project", default="runs/freshness")
    parser.add_argument("--name", required=True)
    args = parser.parse_args()
    expected = {"very_fresh", "fresh", "not_fresh"} if args.part == "eye" else {"fresh", "not_fresh"}
    for split in ("train", "val", "test"):
        path = args.data / split
        classes = {p.name for p in path.iterdir() if p.is_dir()} if path.exists() else set()
        if classes != expected:
            parser.error(f"{split} must contain exactly {sorted(expected)}")
    results = YOLO("yolo11n-cls.pt").train(
        trainer=FreshnessTrainer, data=str(args.data.resolve()), imgsz=224,
        epochs=args.epochs, patience=10, batch=args.batch, device=args.device,
        seed=args.seed, deterministic=True, workers=0, amp=False,
        project=args.project, name=args.name, exist_ok=False,
    )
    print(json.dumps({"part": args.part, "saveDir": str(results.save_dir), "seed": args.seed}))


if __name__ == "__main__":
    main()
