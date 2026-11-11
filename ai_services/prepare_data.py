"""Audit image metadata and build leakage-aware classification splits."""

import argparse
import csv
import hashlib
import json
import shutil
from collections import Counter, defaultdict
from pathlib import Path


def read_rows(path: Path):
    with path.open(encoding="utf-8-sig", newline="") as stream:
        return list(csv.DictReader(stream))


def prepare(metadata: Path, output: Path):
    from sklearn.model_selection import GroupShuffleSplit
    rows = read_rows(metadata)
    required = {"path", "part", "label", "species", "fish_id", "group_id", "source", "license", "label_method"}
    if not rows or not required.issubset(rows[0]):
        raise ValueError(f"Metadata CSV requires {sorted(required)}")
    groups_by_hash = {}
    counts = Counter()
    for row in rows:
        image = Path(row["path"])
        if not image.is_file() or not row["license"] or not row["label_method"]:
            raise ValueError(f"Missing file/license/label method for {image}")
        group = row["group_id"] or row["fish_id"]
        if not group:
            raise ValueError(f"Unverified fish/session identity for {image}; collect metadata before release splitting")
        row["group"] = group
        row["sha256"] = hashlib.sha256(image.read_bytes()).hexdigest()
        previous = groups_by_hash.setdefault(row["sha256"], group)
        if previous != group:
            raise ValueError(f"Duplicate image assigned to different groups: {image}")
        counts[(row["part"], row["label"], row["species"]) ] += 1
    # Split groups globally, preserving pairing between eye and gill and sessions.
    splitter = GroupShuffleSplit(n_splits=1, train_size=0.7, random_state=42)
    train, rest = next(splitter.split(rows, groups=[r["group"] for r in rows]))
    remaining = [rows[i] for i in rest]
    val, test = next(GroupShuffleSplit(n_splits=1, test_size=0.5, random_state=42).split(
        remaining, groups=[r["group"] for r in remaining]))
    splits = {"train": [rows[i] for i in train], "val": [remaining[i] for i in val], "test": [remaining[i] for i in test]}
    expected = {"eye": {"very_fresh", "fresh", "not_fresh"}, "gill": {"fresh", "not_fresh"}}
    parts = {row["part"] for row in rows}
    for split, subset in splits.items():
        for part in parts:
            if {row["label"] for row in subset if row["part"] == part} != expected[part]:
                raise ValueError(f"Split {split}/{part} lacks classes; collect more independent groups")
    if output.exists():
        raise ValueError("Output already exists; use a new versioned dataset directory")
    output.mkdir(parents=True)
    manifest = []
    for split, subset in splits.items():
        seen = set()
        for row in subset:
            if row["sha256"] in seen:
                continue
            seen.add(row["sha256"])
            target = output / row["part"] / split / row["label"] / (row["sha256"] + Path(row["path"]).suffix.lower())
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(row["path"], target)
            manifest.append({**row, "split": split, "prepared_path": str(target)})
    (output / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(json.dumps({"counts": {"/".join(k): v for k, v in counts.items()}, "files": len(manifest)}, indent=2))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--metadata", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    prepare(args.metadata, args.output)


if __name__ == "__main__":
    main()
