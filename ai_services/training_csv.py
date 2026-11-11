"""Read numeric trainer history without optional dataframe CPU dependencies."""

import csv
from pathlib import Path


def read_checkpoint_results_csv(path: Path):
    if not path.exists():
        return {}
    with path.open(encoding="utf-8", newline="") as stream:
        rows = list(csv.DictReader(stream))
    return {key.strip(): [float(row[key]) for row in rows] for key in rows[0]} if rows else {}
