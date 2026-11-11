"""Portable dataset transform shared by training, evaluation and checkpoint loading."""

import cv2
import numpy as np
import torch
from PIL import Image

from .image_pipeline import image_tensor


class CropTensor:
    def __call__(self, image: Image.Image):
        rgb = np.asarray(image.convert("RGB"))
        height, width = rgb.shape[:2]
        side = min(height, width)
        rgb = rgb[(height - side) // 2:(height + side) // 2, (width - side) // 2:(width + side) // 2]
        return torch.from_numpy(image_tensor(cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR))[0])
