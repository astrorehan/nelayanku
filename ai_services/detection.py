"""Optional YOLO11 eye/gill localisation with explicit ambiguity handling."""

import hashlib
from pathlib import Path

import cv2
import numpy as np
import onnxruntime as ort
from pydantic import BaseModel, Field



class DetectorSpec(BaseModel):
    file: str
    sha256: str = Field(pattern=r"^[0-9a-f]{64}$")
    labels: list[str]
    confidenceThreshold: float = Field(ge=0, le=1)
    iouThreshold: float = Field(default=0.45, gt=0, le=1)


class PartDetector:
    def __init__(self, root: Path, spec: DetectorSpec):
        path = (root / spec.file).resolve()
        if not path.is_relative_to(root.resolve()) or hashlib.sha256(path.read_bytes()).hexdigest() != spec.sha256:
            raise ValueError("Detector path or checksum is invalid")
        if len(spec.labels) != 2 or set(spec.labels) != {"eye", "gill"}:
            raise ValueError("Detector labels must be eye and gill")
        options = ort.SessionOptions()
        options.intra_op_num_threads = 1
        self.session = ort.InferenceSession(str(path), sess_options=options, providers=["CPUExecutionProvider"])
        if self.session.get_inputs()[0].shape != [1, 3, 640, 640]:
            raise ValueError("Detector input must be fixed 1x3x640x640")
        self.spec = spec

    def locate(self, image: np.ndarray):
        height, width = image.shape[:2]
        scale = min(640 / width, 640 / height)
        target_width, target_height = round(width * scale), round(height * scale)
        left, top = (640 - target_width) // 2, (640 - target_height) // 2
        padded = np.full((640, 640, 3), 114, dtype=np.uint8)
        padded[top:top + target_height, left:left + target_width] = cv2.resize(image, (target_width, target_height))
        tensor = np.ascontiguousarray(cv2.cvtColor(padded, cv2.COLOR_BGR2RGB).transpose(2, 0, 1)[None], dtype=np.float32) / 255
        output = self.session.run(None, {self.session.get_inputs()[0].name: tensor})[0]
        return detection_crops(image, output, self.spec, left, top, target_width / width, target_height / height)


def detection_crops(image, output, spec, left, top, scale_x, scale_y):
    values = np.asarray(output)
    if values.ndim != 3 or values.shape[0] != 1 or values.shape[1] != 6 or not np.isfinite(values).all():
        raise ValueError("Unexpected YOLO11 detection output")
    proposals = values[0].T
    if (proposals[:, 4:] < 0).any() or (proposals[:, 4:] > 1).any():
        raise ValueError("Detector scores are not probabilities")
    result = {}
    height, width = image.shape[:2]
    for class_index, part in enumerate(spec.labels):
        rows = proposals[proposals[:, 4 + class_index] > spec.confidenceThreshold]
        if len(rows) == 0:
            result[part] = {"reasonCodes": ["part_not_found"], "crop": None, "box": None}
            continue
        boxes = np.column_stack((rows[:, 0] - rows[:, 2] / 2, rows[:, 1] - rows[:, 3] / 2, rows[:, 2], rows[:, 3]))
        kept = cv2.dnn.NMSBoxes(boxes.tolist(), rows[:, 4 + class_index].tolist(), spec.confidenceThreshold, spec.iouThreshold)
        indices = np.asarray(kept).reshape(-1)
        if len(indices) != 1:
            result[part] = {"reasonCodes": ["ambiguous_target"], "crop": None, "box": None}
            continue
        x, y, box_width, box_height = boxes[int(indices[0])]
        x, y, box_width, box_height = (x - left) / scale_x, (y - top) / scale_y, box_width / scale_x, box_height / scale_y
        if box_width <= 0 or box_height <= 0 or x >= width or y >= height or x + box_width <= 0 or y + box_height <= 0:
            result[part] = {"reasonCodes": ["part_not_found"], "crop": None, "box": None}
            continue
        side = min(max(box_width, box_height) * 1.2, width, height)
        x0 = max(0, min(width - side, x + box_width / 2 - side / 2))
        y0 = max(0, min(height - side, y + box_height / 2 - side / 2))
        size = int(np.floor(side))
        if size < 64:
            result[part] = {"reasonCodes": ["crop_too_small"], "crop": None, "box": None}
            continue
        ix, iy = int(np.floor(x0)), int(np.floor(y0))
        crop = image[iy:iy + size, ix:ix + size]
        result[part] = {"reasonCodes": [], "crop": crop, "box": [ix, iy, size, size]}
    return result
