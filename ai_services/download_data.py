"""Download the original licensed datasets with resumable file verification."""

import argparse
import hashlib
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

DATASET = "xzyx7pbr3w"
USER_AGENT = "Nelayanku research dataset downloader"


def fetch_json(url: str):
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.load(response)


def download_file(url: str, destination: Path, sha256: str | None = None, expected_size: int | None = None):
    def valid(path):
        return path.is_file() and (expected_size is None or path.stat().st_size == expected_size) and (
            sha256 is None or hashlib.sha256(path.read_bytes()).hexdigest() == sha256)

    if valid(destination):
        return
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_suffix(destination.suffix + ".part")
    for attempt in range(3):
        try:
            request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(request, timeout=90) as response, temporary.open("wb") as output:
                while chunk := response.read(1024 * 1024):
                    output.write(chunk)
            if not valid(temporary):
                raise ValueError("Downloaded file failed size/checksum validation")
            temporary.replace(destination)
            return
        except (OSError, ValueError):
            if attempt == 2:
                raise RuntimeError(f"Download failed for {destination.name}; retry this command") from None
            time.sleep(2 ** attempt)


def download_ffe(root: Path, workers: int):
    source = root / "ffe" / "source.json"
    source.parent.mkdir(parents=True, exist_ok=True)
    if source.exists():
        metadata = json.loads(source.read_text(encoding="utf-8"))
    else:
        metadata = fetch_json(f"https://data.mendeley.com/public-api/datasets/{DATASET}")
        source.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    if metadata["version"] != 1 or metadata["data_licence"]["short_name"] != "CC BY 4.0":
        raise ValueError("Source version/license changed; review before download")
    files = metadata["files"]
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = []
        for item in files:
            content = item["content_details"]
            extension = Path(item["filename"]).suffix.lower()
            target = source.parent / "images" / (item["id"] + extension)
            futures.append(pool.submit(download_file, content["download_url"], target,
                                       content["sha256_hash"], content["size"]))
        for count, future in enumerate(as_completed(futures), 1):
            future.result()
            if count % 100 == 0 or count == len(files):
                print(f"FFE verified {count}/{len(files)}", flush=True)
    summary = {"dataset": DATASET, "version": 1, "license": "CC BY 4.0", "files": len(files),
               "bytes": sum(item["content_details"]["size"] for item in files)}
    (source.parent / "download-report.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")


def download_roboflow(root: Path, project: str, version: int):
    key = os.getenv("ROBOFLOW_API_KEY")
    if not key:
        raise RuntimeError("Set ROBOFLOW_API_KEY locally to download the licensed Roboflow dataset")
    query = urllib.parse.urlencode({"api_key": key})
    try:
        export = fetch_json(f"https://api.roboflow.com/hanslab/{project}/{version}/folder?{query}")
    except urllib.error.HTTPError as exc:
        raise RuntimeError(f"Roboflow export returned HTTP {exc.code}; verify access and version") from None
    link = export.get("export", {}).get("link")
    if not link:
        raise RuntimeError("Export not ready. Retry after Roboflow finishes preparing the dataset")
    destination = root / project / f"v{version}"
    archive = destination / "dataset.zip"
    download_file(link, archive)
    with zipfile.ZipFile(archive) as zipped:
        for member in zipped.infolist():
            target = (destination / "extracted" / member.filename).resolve()
            if not target.is_relative_to((destination / "extracted").resolve()) or (member.external_attr >> 16) & 0o170000 == 0o120000:
                raise ValueError("Unsafe archive entry")
        zipped.extractall(destination / "extracted")
    # Signed URLs and API credentials are deliberately excluded from provenance.
    report = {"workspace": "hanslab", "project": project, "version": version,
              "archiveSha256": hashlib.sha256(archive.read_bytes()).hexdigest()}
    (destination / "download-report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", choices=["ffe", "hanslab"])
    parser.add_argument("--root", type=Path, default=Path("data/raw"))
    parser.add_argument("--workers", type=int, default=6)
    parser.add_argument("--version", type=int, default=10)
    args = parser.parse_args()
    if args.source == "ffe":
        download_ffe(args.root, args.workers)
    else:
        download_roboflow(args.root, "fish-freshness-classification", args.version)


if __name__ == "__main__":
    main()
