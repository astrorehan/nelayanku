"""Verify every imported image and record geometry without exposing image bytes."""

import argparse
import csv
import json
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image


def inspect_image(row):
    path = Path(row["path"])
    try:
        with Image.open(path) as image:
            width, height = image.size
            image.verify()
        return row["source"], width, height, None
    except (OSError, ValueError) as exc:
        return row["source"], 0, 0, {"path": row["original_path"], "error": type(exc).__name__}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--metadata", type=Path, default=Path("ai_services/data/interim/source-metadata.csv"))
    parser.add_argument("--report", type=Path, default=Path("ai_services/reports/image-audit.json"))
    args = parser.parse_args()
    with args.metadata.open(encoding="utf-8", newline="") as stream:
        rows = list(csv.DictReader(stream))
    with ThreadPoolExecutor(max_workers=4) as pool:
        inspected = list(pool.map(inspect_image, rows))
    valid = [entry for entry in inspected if entry[3] is None]
    failures = [entry[3] for entry in inspected if entry[3] is not None]
    report = {"checked": len(inspected), "valid": len(valid), "failures": failures,
              "sources": dict(Counter(entry[0] for entry in valid)),
              "minSide": min(min(entry[1:3]) for entry in valid),
              "maxSide": max(max(entry[1:3]) for entry in valid)}
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
