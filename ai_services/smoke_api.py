"""Check a locally running service without enabling experimental species."""

import argparse
import io
import json
import os
import time
from pathlib import Path

import httpx
import numpy as np
from PIL import Image


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default="http://127.0.0.1:8010")
    parser.add_argument("--report", type=Path, default=Path("ai_services/reports/http-smoke.json"))
    args = parser.parse_args()
    pixels = np.random.default_rng(42).integers(70, 220, (320, 320, 3), dtype=np.uint8)
    stream = io.BytesIO()
    Image.fromarray(pixels).save(stream, format="PNG")
    token = os.getenv("AI_SERVICE_TOKEN")
    headers = {"authorization": f"Bearer {token}"} if token else {}
    with httpx.Client(base_url=args.url, headers=headers, timeout=20) as client:
        assert client.get("/healthz").json() == {"status": "ok"}
        ready = client.get("/readyz")
        ready.raise_for_status()
        version = ready.json()["modelVersion"]
        results = []
        for part in ["eye", "gill"]:
            times = []
            for _ in range(12):
                start = time.perf_counter()
                response = client.post("/v1/freshness/predict", data={"part": part, "species": "tongkol"},
                                       files={"image": ("synthetic-quality-fixture.png", stream.getvalue(), "image/png")})
                times.append((time.perf_counter() - start) * 1000)
                response.raise_for_status()
                data = response.json()
                assert data["part"] == part and data["modelVersion"] == version
                assert response.headers["x-request-id"] == data["requestId"]
                assert data["status"] == "unassessable" and data["probabilities"] is None
                assert "unsupported_species" in data["reasonCodes"]
            results.append({"part": part, "status": "unassessable", "samples": 11,
                            "warmHttpP50Ms": float(np.percentile(times[1:], 50)),
                            "warmHttpP95Ms": float(np.percentile(times[1:], 95))})
        invalid = client.post("/v1/freshness/predict", data={"part": "eye", "species": "tongkol"},
                              files={"image": ("bad.png", b"invalid", "image/png")})
        assert invalid.status_code == 415 and {"requestId", "code", "message"} <= invalid.json().keys()
        detection = client.post("/v1/freshness/detect", data={"species": "tongkol"},
                                files={"image": ("whole.png", stream.getvalue(), "image/png")})
        assert detection.status_code == 503 and ready.json()["detectorReady"] is False
    report = {"version": version, "runtime": "HTTP loopback Windows desktop", "results": results,
              "checks": ["health", "ready", "both_parts", "request_id", "unsupported_species", "invalid_image", "detector_unavailable"],
              "timingScope": "HTTP/decode/quality/abstain; unsupported species do not execute classifier inference",
              "releaseEligible": False}
    args.report.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
