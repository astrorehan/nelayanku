"""Publish verified, content-addressed model assets to an integration worktree."""

import argparse
import hashlib
import json
from pathlib import Path

from .inference import FreshnessBundle


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--frontend", type=Path, required=True)
    args = parser.parse_args()
    bundle = FreshnessBundle(args.manifest)
    root = args.frontend / "public" / "models"
    if not (args.frontend / "package.json").is_file():
        parser.error("Frontend worktree must contain package.json")
    root.mkdir(parents=True, exist_ok=True)
    published = bundle.manifest.model_dump(exclude_none=True)
    published.pop("detector", None)
    for part, spec in bundle.manifest.models.items():
        data = (args.manifest.parent / spec.file).read_bytes()
        name = hashlib.sha256(data).hexdigest() + ".onnx"
        temporary = root / (name + ".part")
        temporary.write_bytes(data)
        temporary.replace(root / name)
        published["models"][part]["file"] = name
    temporary = root / "manifest.json.part"
    temporary.write_text(json.dumps(published, indent=2), encoding="utf-8")
    temporary.replace(root / "manifest.json")
    print(f"Published bundle {bundle.version} into {root}")


if __name__ == "__main__":
    main()
