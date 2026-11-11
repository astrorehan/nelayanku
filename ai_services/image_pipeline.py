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
    return decode_image(raw, require_square=True)


def decode_image(raw: bytes, require_square: bool = False) -> np.ndarray:
    if len(raw) > MAX_IMAGE_BYTES:
        raise ImageRejected(413, "image_too_large", "Foto melebihi 5 MiB")
    if not (raw.startswith(b"\xff\xd8\xff") or raw.startswith(b"\x89PNG\r\n\x1a\n")):
        raise ImageRejected(415, "unsupported_format", "Gunakan foto JPEG atau PNG")
    try:
        with Image.open(io.BytesIO(raw)) as image:
            width, height = image.size
            if max(width, height) > MAX_SIDE:
                raise ImageRejected(413, "dimensions_exceeded", "Sisi foto maksimal 1280 piksel")
            if require_square and width != height:
                raise ImageRejected(422, "invalid_crop", "Kirim potongan foto berbentuk persegi")
            if getattr(image, "n_frames", 1) != 1:
                raise ImageRejected(415, "animated_image", "Gunakan satu foto diam")
            oriented = ImageOps.exif_transpose(image).convert("RGBA")
            background = Image.new("RGBA", oriented.size, "white")
            rgb = np.asarray(Image.alpha_composite(background, oriented).convert("RGB"))
    except Image.DecompressionBombError as exc:
        raise ImageRejected(413, "dimensions_exceeded", "Dimensi foto melampaui batas") from exc
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        if isinstance(exc, ImageRejected):
            raise
        raise ImageRejected(400, "invalid_image", "Foto tidak dapat dibaca") from exc
    return cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)


def quality_report(bgr: np.ndarray, thresholds: QualityThresholds) -> dict:
    rgb = resize_rgb(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB), 160).astype(np.float64)
    gray = (rgb @ np.array([0.2126, 0.7152, 0.0722])).astype(np.float32).astype(np.float64)
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
    resized = resize_rgb(rgb, 224)
    return np.ascontiguousarray(resized.transpose(2, 0, 1)[None], dtype=np.float32) / 255.0


def resize_rgb(rgb: np.ndarray, side: int) -> np.ndarray:
    """Pixel-centred bilinear RGB resize with a portable integer rounding policy."""
    height, width = rgb.shape[:2]
    xs = np.clip((np.arange(side) + 0.5) * width / side - 0.5, 0, width - 1)
    ys = np.clip((np.arange(side) + 0.5) * height / side - 0.5, 0, height - 1)
    x0, y0 = np.floor(xs).astype(int), np.floor(ys).astype(int)
    x1, y1 = np.minimum(x0 + 1, width - 1), np.minimum(y0 + 1, height - 1)
    wx, wy = (xs - x0)[None, :, None], (ys - y0)[:, None, None]
    top = rgb[y0[:, None], x0].astype(np.float64) * (1 - wx) + rgb[y0[:, None], x1] * wx
    bottom = rgb[y1[:, None], x0].astype(np.float64) * (1 - wx) + rgb[y1[:, None], x1] * wx
    return np.floor(top * (1 - wy) + bottom * wy + 0.5).clip(0, 255).astype(np.uint8)
