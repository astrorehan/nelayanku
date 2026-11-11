"""Bounded image decoding and shared preprocessing for classifiers."""

import io
from dataclasses import dataclass

import cv2
import numpy as np
from PIL import Image, ImageOps, UnidentifiedImageError

MAX_IMAGE_BYTES = 5 * 1024 * 1024
MAX_SIDE = 1280
MIN_SIDE = 64


class ImageRejected(ValueError):
    def __init__(self, status: int, code: str, message: str):
        super().__init__(message)
        self.status = status
        self.code = code


@dataclass(frozen=True)
class QualityThresholds:
    dark: float = 65.0
    glare: float = 0.25
    sharpness: float = 70.0


def decode_crop(raw: bytes) -> np.ndarray:
    if len(raw) > MAX_IMAGE_BYTES:
        raise ImageRejected(413, "image_too_large", "Foto melebihi 5 MiB")
    if not (raw.startswith(b"\xff\xd8\xff") or raw.startswith(b"\x89PNG\r\n\x1a\n")):
        raise ImageRejected(415, "unsupported_format", "Gunakan foto JPEG atau PNG")
    try:
        with Image.open(io.BytesIO(raw)) as image:
            width, height = image.size
            if max(width, height) > MAX_SIDE:
                raise ImageRejected(413, "dimensions_exceeded", "Sisi foto maksimal 1280 piksel")
            if width != height:
                raise ImageRejected(422, "invalid_crop", "Kirim potongan foto berbentuk persegi")
            if getattr(image, "n_frames", 1) != 1:
                raise ImageRejected(415, "animated_image", "Gunakan satu foto diam")
            oriented = ImageOps.exif_transpose(image).convert("RGBA")
            background = Image.new("RGBA", oriented.size, "white")
            rgb = np.asarray(Image.alpha_composite(background, oriented).convert("RGB"))
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        if isinstance(exc, ImageRejected):
            raise
        raise ImageRejected(400, "invalid_image", "Foto tidak dapat dibaca") from exc
    return cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)


def quality_report(bgr: np.ndarray, thresholds: QualityThresholds) -> dict:
    sample = cv2.resize(bgr, (160, 160), interpolation=cv2.INTER_LINEAR)
    rgb = cv2.cvtColor(sample, cv2.COLOR_BGR2RGB).astype(np.float64)
    gray = rgb @ np.array([0.2126, 0.7152, 0.0722])
    # Match the four-neighbour kernel and interior-only policy of the browser.
    laplace = cv2.Laplacian(gray, cv2.CV_64F, ksize=1)[1:-1, 1:-1]
    mean = float(gray.mean())
    glare = float((gray > 245).mean())
    sharpness = float(laplace.var())
    reasons = []
    if min(bgr.shape[:2]) < MIN_SIDE:
        reasons.append("crop_too_small")
    if mean < thresholds.dark:
        reasons.append("too_dark")
    if glare > thresholds.glare:
        reasons.append("glare")
    if sharpness < thresholds.sharpness:
        reasons.append("blurry")
    return {"meanLuminance": mean, "glareShare": glare, "sharpness": sharpness, "reasons": reasons}


def image_tensor(bgr: np.ndarray) -> np.ndarray:
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    resized = cv2.resize(rgb, (224, 224), interpolation=cv2.INTER_LINEAR)
    return np.ascontiguousarray(resized.transpose(2, 0, 1)[None], dtype=np.float32) / 255.0
