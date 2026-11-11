import numpy as np

from ai_services.detection import DetectorSpec, detection_crops


def spec():
    return DetectorSpec(file="fixture.onnx", sha256="0" * 64, labels=["eye", "gill"], confidenceThreshold=0.5)


def test_letterbox_coordinates_map_to_original_image():
    image = np.zeros((320, 640, 3), dtype=np.uint8)
    # Original eye at (320, 160), offset down by 160 from letterboxing.
    output = np.array([[[320], [320], [100], [80], [0.9], [0.1]]], dtype=np.float32)
    result = detection_crops(image, output, spec(), 0, 160, 1, 1)
    x, y, width, height = result["eye"]["box"]
    assert x + width / 2 == 320
    assert y + height / 2 == 160
    assert result["eye"]["crop"].shape[:2] == (120, 120)
    assert result["gill"]["reasonCodes"] == ["part_not_found"]


def test_two_targets_require_guided_crop():
    image = np.zeros((640, 640, 3), dtype=np.uint8)
    output = np.array([[[100, 500], [100, 500], [80, 80], [80, 80], [0.9, 0.9], [0.1, 0.1]]], dtype=np.float32)
    result = detection_crops(image, output, spec(), 0, 0, 1, 1)
    assert result["eye"]["reasonCodes"] == ["ambiguous_target"]


def test_boxes_outside_image_do_not_crop_unrelated_pixels():
    image = np.zeros((640, 640, 3), dtype=np.uint8)
    output = np.array([[[900], [900], [80], [80], [0.9], [0.1]]], dtype=np.float32)
    result = detection_crops(image, output, spec(), 0, 0, 1, 1)
    assert result["eye"]["crop"] is None
