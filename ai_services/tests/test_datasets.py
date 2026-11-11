import csv

import pytest

from ai_services.prepare_data import index_sources, prepare, read_rows
from ai_services.training_csv import read_checkpoint_results_csv


def test_source_index_requires_manual_extraction(tmp_path):
    with pytest.raises(ValueError, match="extract the dataset manually"):
        index_sources(tmp_path / "raw", tmp_path / "metadata.csv")
    assert not (tmp_path / "metadata.csv").exists()


def test_source_index_preserves_labels_provenance_and_source_families(tmp_path):
    fixtures = {
        "ffe/Rastrelliger Faughni - Highly Fresh/eye.jpg": b"eye",
        "hanslab/v10/train/gill-non-fresh/fish-12_jpg.rf.abc.jpg": b"gill-a",
        "hanslab/v10/train/gill-fresh/other-2_jpg.rf.def.jpg": b"gill-b",
        "hanslab/v10/train/eye-fresh/binary-eye.jpg": b"unused",
    }
    for relative, content in fixtures.items():
        path = tmp_path / "raw" / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)
    metadata = tmp_path / "metadata.csv"
    rows = index_sources(tmp_path / "raw", metadata)
    assert read_rows(metadata) == rows
    assert len(rows) == 3
    eye = next(row for row in rows if row["part"] == "eye")
    assert (eye["label"], eye["species"], eye["group_verified"]) == ("very_fresh", "rastrelliger_faughni", "species_block")
    gill = next(row for row in rows if row["label"] == "not_fresh")
    assert gill["group_id"] == "hanslab-family:fish"
    assert (gill["species"], gill["group_verified"], gill["source_version"]) == ("unknown", "unverified", "10")
    assert all(row["license"] == "CC BY 4.0" and len(row["sha256"]) == 64 for row in rows)


def test_release_split_rejects_unverified_grouping(tmp_path):
    image = tmp_path / "one.jpg"
    image.write_bytes(b"source")
    metadata = tmp_path / "metadata.csv"
    row = {"path": str(image), "part": "eye", "label": "fresh", "species": "unknown", "fish_id": "",
           "group_id": "filename-family", "group_verified": "unverified", "source": "test", "license": "test",
           "label_method": "test"}
    with metadata.open("w", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=list(row))
        writer.writeheader()
        writer.writerow(row)
    with pytest.raises(ValueError, match="exploratory"):
        prepare(metadata, tmp_path / "output")


def test_group_split_preserves_eye_gill_and_all_timepoints(tmp_path):
    import json
    rows = []
    for fish in range(12):
        for part, labels in [("eye", ["fresh", "not_fresh", "very_fresh"]), ("gill", ["fresh", "not_fresh"])]:
            for label in labels:
                path = tmp_path / f"{fish}-{part}-{label}.jpg"
                path.write_bytes(f"fixture {fish} {part} {label}".encode())
                rows.append({"path": str(path), "part": part, "label": label, "species": "kembung",
                             "fish_id": f"fish-{fish}", "group_id": f"fish-{fish}", "group_verified": "fish",
                             "source": "fixture", "license": "fixture", "label_method": "fixture"})
    metadata = tmp_path / "metadata.csv"
    with metadata.open("w", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    output = tmp_path / "prepared"
    prepare(metadata, output)
    results = json.loads((output / "manifest.json").read_text())
    for fish in range(12):
        assert len({row["split"] for row in results if row["fish_id"] == f"fish-{fish}"}) == 1
    assert {row["split"] for row in results} == {"train", "val", "test"}


def test_checkpoint_history_preserves_numeric_columns(tmp_path):
    path = tmp_path / "results.csv"
    assert read_checkpoint_results_csv(path) == {}
    path.write_text(" epoch, metrics/accuracy_top1\n1,0.5\n2,0.75\n")
    assert read_checkpoint_results_csv(path) == {"epoch": [1.0, 2.0], "metrics/accuracy_top1": [0.5, 0.75]}
