import hashlib
import io
import json
import threading
from concurrent.futures import ThreadPoolExecutor

import numpy as np
import onnx
import pytest
from fastapi.testclient import TestClient
from onnx import TensorProto, helper
from PIL import Image

from ai_services.app import create_app
from ai_services.inference import FreshnessBundle
from ai_services.image_pipeline import ImageRejected, QualityThresholds, decode_crop, image_tensor, quality_report


def photo(size=(224, 224), color=None):
    pixels = np.random.default_rng(42).integers(50, 220, (*size, 3), dtype=np.uint8)
    image = Image.new("RGB", size, color) if color else Image.fromarray(pixels)
    out = io.BytesIO()
    image.save(out, format="PNG")
    return out.getvalue()


@pytest.fixture
def manifest(tmp_path):
    models = {}
    for part, labels in [("eye", ["fresh", "not_fresh", "very_fresh"]), ("gill", ["fresh", "not_fresh"])]:
        # Synthetic models verify plumbing only, and never enter production artifacts.
        values = [0.1, 0.1, 0.8] if part == "eye" else [0.9, 0.1]
        output = helper.make_tensor("values", TensorProto.FLOAT, [1, len(labels)], values)
        node = helper.make_node("Constant", [], ["probabilities"], value=output)
        graph = helper.make_graph([node], "fixture", [helper.make_tensor_value_info("image", TensorProto.FLOAT, [1, 3, 224, 224])],
                                  [helper.make_tensor_value_info("probabilities", TensorProto.FLOAT, [1, len(labels)])])
        model = helper.make_model(graph, opset_imports=[helper.make_opsetid("", 17)])
        model.ir_version = 9
        target = tmp_path / f"{part}.onnx"
        onnx.save(model, target)
        models[part] = {"file": target.name, "sha256": hashlib.sha256(target.read_bytes()).hexdigest(),
                        "labels": labels, "supportedSpecies": ["kembung"], "outputType": "probabilities", "confidenceThreshold": 0.7}
    result = tmp_path / "manifest.json"
    result.write_text(json.dumps({"version": "test-only", "preprocessing": "rgb-bilinear-224-f32-nchw-v1", "models": models}))
    return result


def send(client, raw=None, part="eye", species="kembung"):
    return client.post("/v1/freshness/predict", data={"part": part, "species": species},
                       files={"image": ("crop.png", raw or photo(), "image/png")})


def test_both_parts_and_label_order(manifest):
    with TestClient(create_app(manifest)) as client:
        assert client.get("/readyz").status_code == 200
        eye = send(client).json()
        assert eye["status"] == "ok"
        assert eye["probabilities"]["veryFresh"] == pytest.approx(0.8)
        gill = send(client, part="gill").json()
        assert gill["probabilities"]["fresh"] == pytest.approx(0.9)
        assert set(gill["probabilities"]) == {"fresh", "notFresh"}
        assert eye["modelVersion"] == "test-only"


@pytest.mark.parametrize("color,reason", [("black", "too_dark"), ("white", "glare"), ("grey", "blurry")])
def test_quality_abstains_without_probabilities(manifest, color, reason):
    with TestClient(create_app(manifest)) as client:
        result = send(client, photo(color=color)).json()
        assert result["status"] == "unassessable"
        assert result["probabilities"] is None
        assert reason in result["reasonCodes"]


def test_unknown_species_abstains(manifest):
    with TestClient(create_app(manifest)) as client:
        assert send(client, species="tongkol").json()["reasonCodes"] == ["unsupported_species"]


@pytest.mark.parametrize("raw,status", [(b"not an image", 415), (b"\xff\xd8\xffbroken", 400),
                                        (photo((100, 200)), 422), (photo((1281, 1281)), 413)],
                         ids=["unsupported", "corrupt", "non-square", "too-large"])
def test_invalid_images(manifest, raw, status):
    with TestClient(create_app(manifest)) as client:
        response = send(client, raw)
        assert response.status_code == status
        assert set(response.json()) == {"requestId", "code", "message"}


def test_missing_bundle_and_bad_fields(tmp_path):
    with TestClient(create_app(tmp_path / "missing.json")) as client:
        assert client.get("/healthz").status_code == 200
        assert client.get("/readyz").status_code == 503
        assert send(client).status_code == 503
        assert send(client, part="wrong").status_code == 422


def test_checksum_failure_disables_readiness(manifest):
    (manifest.parent / "eye.onnx").write_bytes(b"changed")
    with TestClient(create_app(manifest)) as client:
        assert client.get("/readyz").status_code == 503


def test_token_is_enforced(manifest, monkeypatch):
    monkeypatch.setenv("AI_SERVICE_TOKEN", "test-token")
    with TestClient(create_app(manifest)) as client:
        assert send(client).status_code == 401
        assert client.post("/v1/freshness/predict", headers={"Authorization": "Bearer test-token"},
                           data={"part": "eye", "species": "kembung"}, files={"image": ("x.png", photo())}).status_code == 200


def test_tensor_preserves_rgb_order():
    image = decode_crop(photo(color=(255, 0, 0)))
    tensor = image_tensor(image)
    assert tensor.shape == (1, 3, 224, 224)
    assert tensor[0, 0, 0, 0] == 1
    assert tensor[0, 2, 0, 0] == 0


def test_small_crop_abstains(manifest):
    with TestClient(create_app(manifest)) as client:
        assert "crop_too_small" in send(client, photo((32, 32))).json()["reasonCodes"]


def test_low_confidence_abstains(manifest):
    data = json.loads(manifest.read_text())
    data["models"]["eye"]["confidenceThreshold"] = 0.99
    manifest.write_text(json.dumps(data))
    with TestClient(create_app(manifest)) as client:
        assert send(client).json()["reasonCodes"] == ["low_confidence"]


def test_oversized_multipart_is_rejected(manifest):
    with TestClient(create_app(manifest)) as client:
        response = send(client, b"x" * (5 * 1024 * 1024 + 65537))
        assert response.status_code == 413


def test_detector_is_explicitly_unavailable_without_weights(manifest):
    with TestClient(create_app(manifest)) as client:
        response = client.post("/v1/freshness/detect", data={"species": "kembung"},
                               files={"image": ("whole.png", photo())})
        assert response.status_code == 503
        assert client.get("/readyz").json()["detectorReady"] is False


def test_exif_orientation_is_applied_once():
    pixels = np.zeros((80, 80, 3), dtype=np.uint8)
    pixels[:40, :, 0] = 255
    image = Image.fromarray(pixels)
    exif = image.getexif()
    exif[274] = 6
    encoded = io.BytesIO()
    image.save(encoded, format="JPEG", exif=exif)
    bgr = decode_crop(encoded.getvalue())
    assert bgr[40, 65, 2] > 200
    assert bgr[40, 15, 2] < 40


def test_full_photo_detector_pipeline(manifest):
    boxes = [160, 480, 320, 320, 160, 160, 160, 160, 0.95, 0.05, 0.05, 0.95]
    value = helper.make_tensor("boxes", TensorProto.FLOAT, [1, 6, 2], boxes)
    node = helper.make_node("Constant", [], ["detections"], value=value)
    graph = helper.make_graph([node], "detector-fixture", [helper.make_tensor_value_info("image", TensorProto.FLOAT, [1, 3, 640, 640])],
                              [helper.make_tensor_value_info("detections", TensorProto.FLOAT, [1, 6, 2])])
    model = helper.make_model(graph, opset_imports=[helper.make_opsetid("", 17)])
    model.ir_version = 9
    target = manifest.parent / "detector.onnx"
    onnx.save(model, target)
    data = json.loads(manifest.read_text())
    data["detector"] = {"file": target.name, "sha256": hashlib.sha256(target.read_bytes()).hexdigest(),
                        "labels": ["eye", "gill"], "confidenceThreshold": 0.5}
    manifest.write_text(json.dumps(data))
    with TestClient(create_app(manifest)) as client:
        response = client.post("/v1/freshness/detect", data={"species": "kembung"},
                               files={"image": ("whole.png", photo((640, 640)))})
        assert response.status_code == 200
        for part in ["eye", "gill"]:
            result = response.json()["parts"][part]
            assert result["status"] == "ok"
            assert result["box"][2:] == [192, 192]
        assert client.get("/readyz").json()["detectorReady"] is True


def test_inference_capacity_is_bounded(manifest, monkeypatch):
    original = FreshnessBundle.predict
    entered = threading.Event()
    release = threading.Event()
    lock = threading.Lock()
    active = 0

    def held_prediction(bundle, *args):
        nonlocal active
        with lock:
            active += 1
            if active == 2:
                entered.set()
        assert release.wait(5)
        return original(bundle, *args)

    monkeypatch.setattr(FreshnessBundle, "predict", held_prediction)
    with TestClient(create_app(manifest)) as client, ThreadPoolExecutor(max_workers=2) as pool:
        requests = [pool.submit(send, client) for _ in range(2)]
        try:
            assert entered.wait(5)
            assert send(client).status_code == 429
        finally:
            release.set()
        assert all(request.result().status_code == 200 for request in requests)
