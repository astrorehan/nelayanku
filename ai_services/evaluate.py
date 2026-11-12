"""Evaluate a frozen classifier on the recorded split, with species breakdowns."""

import argparse
import json
from collections import defaultdict
from pathlib import Path

import numpy as np
import torch
from PIL import Image
from sklearn.metrics import classification_report, confusion_matrix
from ultralytics import YOLO

from .training_data import CropTensor
from .inference import FreshnessBundle


def evaluate(checkpoint: Path | None, dataset: Path, part: str, split: str, report: Path, manifest: Path | None = None):
    torch.set_num_threads(2)
    entries = json.loads((dataset / "manifest.json").read_text(encoding="utf-8"))
    split_report = json.loads((dataset / "split-report.json").read_text(encoding="utf-8"))
    selected = [row for row in entries if row["part"] == part and row["split"] == split]
    if not selected:
        raise ValueError("Requested evaluation split is empty")
    if manifest:
        bundle = FreshnessBundle(manifest)
        labels = bundle.manifest.models[part].labels
        session = bundle.sessions[part]
        model = None
    else:
        classifier = YOLO(str(checkpoint))
        labels = [classifier.names[i] for i in range(len(classifier.names))]
        model = classifier.model.cpu().float().eval()
    transform = CropTensor()
    predicted, targets, species, probabilities = [], [], [], []
    for start in range(0, len(selected), 32):
        batch = selected[start:start + 32]
        tensors = []
        for row in batch:
            with Image.open(row["prepared_path"]) as image:
                tensors.append(transform(image))
        if model is None:
            values = np.concatenate([session.run(None, {session.get_inputs()[0].name: tensor[None].numpy()})[0] for tensor in tensors])
        else:
            with torch.inference_mode():
                output = model(torch.stack(tensors))
                values = output[0] if isinstance(output, tuple) else output
                values = values.numpy()
        probabilities.extend(values.tolist())
        predicted.extend(values.argmax(axis=1).tolist())
        targets.extend(labels.index(row["label"]) for row in batch)
        species.extend(row["species"] for row in batch)
    groups = defaultdict(list)
    for index, name in enumerate(species):
        groups[name].append(index)

    def metrics(indices):
        truth = [targets[index] for index in indices]
        prediction = [predicted[index] for index in indices]
        return {"count": len(indices), "classification": classification_report(
            truth, prediction, labels=list(range(len(labels))), target_names=labels, output_dict=True, zero_division=0),
            "confusionMatrix": confusion_matrix(truth, prediction, labels=list(range(len(labels)))).tolist()}

    confidence = np.max(probabilities, axis=1)
    actual = np.array(targets)
    estimated = np.array(predicted)
    not_fresh = labels.index("not_fresh")
    ece = 0.0
    for low in np.linspace(0, 0.9, 10):
        mask = (confidence >= low) & (confidence <= low + 0.1 if low > 0.89 else confidence < low + 0.1)
        if mask.any():
            ece += mask.mean() * abs((actual[mask] == estimated[mask]).mean() - confidence[mask].mean())
    result = {"checkpoint": checkpoint.as_posix() if checkpoint else None,
              "manifest": manifest.as_posix() if manifest else None, "part": part, "split": split, "labels": labels,
              "exploratory": split_report["exploratory"], "releaseEligible": False,
              "overall": metrics(range(len(selected))), "perSpecies": {key: metrics(value) for key, value in groups.items()},
              "expectedCalibrationError": float(ece),
              "wrongFreshCount": int(((actual == not_fresh) & (estimated != not_fresh)).sum()),
              "notFreshCount": int((actual == not_fresh).sum()),
              "coverageAt08": float((confidence >= 0.8).mean()),
              "limitations": ["Source dataset evaluation; local expert-labelled phone test is still required",
                              "Exploratory source-family grouping does not establish fish-independent validation for HansLab"]}
    report.parent.mkdir(parents=True, exist_ok=True)
    report.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(json.dumps(result, indent=2))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    model_source = parser.add_mutually_exclusive_group(required=True)
    model_source.add_argument("--checkpoint", type=Path)
    model_source.add_argument("--manifest", type=Path)
    parser.add_argument("--dataset", type=Path, required=True)
    parser.add_argument("--part", choices=["eye", "gill"], required=True)
    parser.add_argument("--split", choices=["val", "test"], default="val")
    parser.add_argument("--report", type=Path, required=True)
    args = parser.parse_args()
    evaluate(args.checkpoint, args.dataset, args.part, args.split, args.report, args.manifest)


if __name__ == "__main__":
    main()
