"""Verified ONNX bundles. Species activation comes from the model card."""

import hashlib
from pathlib import Path
from typing import Literal

import numpy as np
import onnxruntime as ort
from pydantic import BaseModel, ConfigDict, Field

from .image_pipeline import QualityThresholds, decode_crop, decode_image, image_tensor, quality_report
from .detection import DetectorSpec, PartDetector

PART_LABELS = {"eye": {"very_fresh", "fresh", "not_fresh"}, "gill": {"fresh", "not_fresh"}}
JSON_LABELS = {"very_fresh": "veryFresh", "fresh": "fresh", "not_fresh": "notFresh"}


class ModelSpec(BaseModel):
    model_config = ConfigDict(extra="forbid")
    file: str
    sha256: str = Field(pattern=r"^[0-9a-f]{64}$")
    labels: list[str]
    supportedSpecies: list[Literal["kembung", "tongkol", "cakalang"]]
    outputType: Literal["logits", "probabilities"]
    confidenceThreshold: float = Field(ge=0, le=1)
    inputName: str | None = None
    outputName: str | None = None
    darkThreshold: float = Field(default=65, ge=0, le=255)
    glareThreshold: float = Field(default=0.25, ge=0, le=1)
    sharpnessThreshold: float = Field(default=70, ge=0)


class Manifest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    version: str = Field(min_length=1)
    preprocessing: Literal["rgb-bilinear-224-f32-nchw-v1"]
    models: dict[Literal["eye", "gill"], ModelSpec]
    detector: DetectorSpec | None = None


class FreshnessBundle:
    def __init__(self, manifest_path: Path):
        self.manifest = Manifest.model_validate_json(manifest_path.read_text(encoding="utf-8"))
        if set(self.manifest.models) != set(PART_LABELS):
            raise ValueError("A bundle must contain both eye and gill models")
        self.sessions = {}
        root = manifest_path.parent.resolve()
        for part, spec in self.manifest.models.items():
            if len(spec.labels) != len(PART_LABELS[part]) or set(spec.labels) != PART_LABELS[part]:
                raise ValueError(f"Invalid labels for {part}")
            path = (root / spec.file).resolve()
            if not path.is_relative_to(root):
                raise ValueError("Model path escapes bundle directory")
            if hashlib.sha256(path.read_bytes()).hexdigest() != spec.sha256:
                raise ValueError(f"Checksum mismatch for {part}")
            options = ort.SessionOptions()
            options.intra_op_num_threads = 1
            session = ort.InferenceSession(str(path), sess_options=options, providers=["CPUExecutionProvider"])
            inputs, outputs = session.get_inputs(), session.get_outputs()
            if len(inputs) != 1 or inputs[0].shape != [1, 3, 224, 224] or inputs[0].type != "tensor(float)":
                raise ValueError(f"Invalid input tensor for {part}")
            if len(outputs) != 1 or outputs[0].shape != [1, len(spec.labels)]:
                raise ValueError(f"Invalid output tensor for {part}")
            if (spec.inputName and spec.inputName != inputs[0].name) or (spec.outputName and spec.outputName != outputs[0].name):
                raise ValueError(f"Tensor names do not match manifest for {part}")
            self.sessions[part] = session
        self.version = self.manifest.version
        self.detector = PartDetector(root, self.manifest.detector) if self.manifest.detector else None

    def predict(self, raw: bytes, part: str, species: str) -> dict:
        return self.assess_image(decode_crop(raw), part, species)

    def assess_image(self, image, part: str, species: str) -> dict:
        spec = self.manifest.models[part]
        quality = quality_report(image, QualityThresholds(spec.darkThreshold, spec.glareThreshold, spec.sharpnessThreshold))
        result = {"status": "unassessable", "part": part, "species": species,
                  "modelVersion": self.version, "probabilities": None, "reasonCodes": []}
        if species not in spec.supportedSpecies:
            result["reasonCodes"] = ["unsupported_species"]
            return result
        if quality["reasons"]:
            result["reasonCodes"] = quality["reasons"]
            return result
        session = self.sessions[part]
        values = session.run(None, {session.get_inputs()[0].name: image_tensor(image)})[0].reshape(-1).astype(np.float64)
        if not np.isfinite(values).all():
            raise ValueError("Model produced non-finite output")
        if spec.outputType == "logits":
            values = np.exp(values - values.max())
            values /= values.sum()
        if (values < 0).any() or (values > 1).any() or not np.isclose(values.sum(), 1, atol=1e-4):
            raise ValueError("Model output is not a probability distribution")
        if values.max() < spec.confidenceThreshold:
            result["reasonCodes"] = ["low_confidence"]
            return result
        result.update(status="ok", probabilities={JSON_LABELS[label]: float(value) for label, value in zip(spec.labels, values)})
        return result

    def predict_whole(self, raw: bytes, species: str) -> dict:
        if self.detector is None:
            raise ValueError("Validated detector is not configured")
        image = decode_image(raw)
        located = self.detector.locate(image)
        ambiguous = any("ambiguous_target" in item["reasonCodes"] for item in located.values())
        parts = {}
        for part, item in located.items():
            reasons = ["ambiguous_target"] if ambiguous else item["reasonCodes"]
            if reasons:
                parts[part] = {"status": "unassessable", "part": part, "species": species,
                               "modelVersion": self.version, "probabilities": None, "reasonCodes": reasons, "box": None}
            else:
                parts[part] = {**self.assess_image(item["crop"], part, species), "box": item["box"]}
        return {"modelVersion": self.version, "parts": parts}
