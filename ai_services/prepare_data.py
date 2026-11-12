"""Audit image metadata and build leakage-aware classification splits."""

import argparse
import csv
import hashlib
import json
import re
import shutil
from collections import Counter
from pathlib import Path


def index_sources(raw: Path, metadata: Path):
    """Index the two manually extracted datasets; no download or extraction."""
    rows = []
    sources = [("FFE", raw / "ffe"), ("HansLab", raw / "hanslab" / "v10")]
    for source, root in sources:
        images = sorted(root.rglob("*.jpg"))
        if not images:
            raise ValueError(f"No images in {root}; extract the dataset manually first")
        for path in images:
            if source == "FFE":
                species, source_label = re.split(r"\s+-\s+", path.parent.name, maxsplit=1)
                labels = {"Highly Fresh": "very_fresh", "Fresh": "fresh", "Not Fresh": "not_fresh"}
                label = labels[source_label.strip()]
                part, version = "eye", "1"
                group, verified = f"ffe-species:{species}", "species_block"
                species = species.lower().replace(" ", "_")
                method, source_split = "source_storage_day_proxy", ""
            else:
                source_class = path.parent.name
                if source_class in {"eye-fresh", "eye-non-fresh"}:
                    continue  # Binary labels cannot supply the three-class eye target.
                if source_class not in {"gill-fresh", "gill-non-fresh"}:
                    raise ValueError(f"Unknown source class: {source_class}")
                label = "fresh" if source_class == "gill-fresh" else "not_fresh"
                part, version, species = "gill", "10", "unknown"
                original = path.name.split(".rf.")[0]
                family = re.sub(r"(?:-Small)?_(?:jpeg|jpg|png)$", "", original, flags=re.I)
                family = re.sub(r"-\d+$", "", family)
                group, verified = f"hanslab-family:{family}", "unverified"
                method, source_split = "source_binary_annotation", path.relative_to(root).parts[0]
            rows.append({"path": path.as_posix(), "part": part, "label": label, "species": species,
                         "fish_id": "", "group_id": group, "group_verified": verified,
                         "source": source, "source_version": version, "license": "CC BY 4.0",
                         "label_method": method, "original_path": path.relative_to(root).as_posix(),
                         "source_split": source_split, "sha256": hashlib.sha256(path.read_bytes()).hexdigest()})
    metadata.parent.mkdir(parents=True, exist_ok=True)
    with metadata.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    return rows


def read_rows(path: Path):
    with path.open(encoding="utf-8-sig", newline="") as stream:
        return list(csv.DictReader(stream))


def prepare(metadata: Path, output: Path, exploratory: bool = False):
    from sklearn.model_selection import GroupShuffleSplit
    rows = read_rows(metadata)
    required = {"path", "part", "label", "species", "fish_id", "group_id", "source", "license", "label_method"}
    if not rows or not required.issubset(rows[0]):
        raise ValueError(f"Metadata CSV requires {sorted(required)}")
    groups_by_hash = {}
    counts = Counter()
    fish_groups = {}
    for row in rows:
        image = Path(row["path"])
        if not image.is_file() or not row["license"] or not row["label_method"]:
            raise ValueError(f"Missing file/license/label method for {image}")
        group = row["group_id"] or row["fish_id"]
        if not group:
            raise ValueError(f"Unverified fish/session identity for {image}; collect metadata before release splitting")
        if row.get("group_verified", "") not in {"fish", "session", "species_block"} and not exploratory:
            raise ValueError(f"Unverified grouping for {image}; exploratory runs require --exploratory")
        if row["fish_id"]:
            previous_group = fish_groups.setdefault(row["fish_id"], group)
            if previous_group != group:
                raise ValueError(f"Fish {row['fish_id']} appears in different groups")
        row["group"] = group
        row["sha256"] = hashlib.sha256(image.read_bytes()).hexdigest()
        previous = groups_by_hash.setdefault(row["sha256"], group)
        if previous != group:
            raise ValueError(f"Duplicate image assigned to different groups: {image}")
        counts[(row["part"], row["label"], row["species"])] += 1
    # Split groups globally, preserving pairing between eye and gill and sessions.
    expected = {"eye": {"very_fresh", "fresh", "not_fresh"}, "gill": {"fresh", "not_fresh"}}
    parts = {row["part"] for row in rows}
    # Retry seeds only to obtain class coverage, before any model is trained.
    for seed in range(42, 142):
        train, rest = next(GroupShuffleSplit(n_splits=1, train_size=0.7, random_state=seed).split(
            rows, groups=[row["group"] for row in rows]))
        remaining = [rows[i] for i in rest]
        val, test = next(GroupShuffleSplit(n_splits=1, test_size=0.5, random_state=seed).split(
            remaining, groups=[row["group"] for row in remaining]))
        splits = {"train": [rows[i] for i in train], "val": [remaining[i] for i in val], "test": [remaining[i] for i in test]}
        if all({row["label"] for row in subset if row["part"] == part} == expected[part]
               for subset in splits.values() for part in parts):
            break
    for split, subset in splits.items():
        for part in parts:
            if {row["label"] for row in subset if row["part"] == part} != expected[part]:
                raise ValueError(f"Split {split}/{part} lacks classes; collect more independent groups")
    if output.exists():
        raise ValueError("Output already exists; use a new versioned dataset directory")
    labels_by_hash = {}
    for row in rows:
        labels_by_hash.setdefault((row["part"], row["sha256"]), set()).add(row["label"])
    if any(len(labels) > 1 for labels in labels_by_hash.values()):
        raise ValueError("An identical image has conflicting labels; review source metadata")
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
    summary = {"exploratory": exploratory, "seed": seed, "release_eligible": not exploratory,
               "counts": dict(Counter(f'{row["part"]}/{row["split"]}/{row["label"]}' for row in manifest)),
               "grouping": dict(Counter(row.get("group_verified", "") for row in manifest))}
    (output / "split-report.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps({"counts": {"/".join(k): v for k, v in counts.items()}, "files": len(manifest)}, indent=2))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--raw", type=Path, help="Index FFE and HansLab folders already extracted manually")
    parser.add_argument("--metadata", type=Path, default=Path("ai_services/data/interim/source-metadata.csv"))
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--exploratory", action="store_true", help="Allow unverified source families for experimental training only")
    args = parser.parse_args()
    if args.raw:
        if args.output.exists():
            parser.error("Output already exists; use a new versioned dataset directory")
        index_sources(args.raw, args.metadata)
    prepare(args.metadata, args.output, args.exploratory)


if __name__ == "__main__":
    main()
