import { describe, expect, it } from "vitest";
import { assessImageQuality, type PixelBuffer } from "./image-quality";

function buffer(width: number, height: number, luminanceAt: (x: number, y: number) => number): PixelBuffer {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = luminanceAt(x, y);
      data.set([value, value, value, 255], (y * width + x) * 4);
    }
  }
  return { width, height, data };
}

const checkerboard = (x: number, y: number) => ((Math.floor(x / 4) + Math.floor(y / 4)) % 2 === 0 ? 70 : 190);

describe("assessImageQuality", () => {
  it("passes a sharp, evenly lit image", () => {
    expect(assessImageQuality(buffer(160, 160, checkerboard)).problems).toEqual([]);
  });

  it("flags a dark image", () => {
    expect(assessImageQuality(buffer(160, 160, (x, y) => checkerboard(x, y) / 4)).problems).toContain("too_dark");
  });

  it("flags glare when a large share of pixels is blown out", () => {
    const glaring = buffer(160, 160, (x, y) => (y < 60 ? 255 : checkerboard(x, y)));
    expect(assessImageQuality(glaring).problems).toContain("glare");
  });

  it("flags a flat, blurry image", () => {
    expect(assessImageQuality(buffer(160, 160, () => 128)).problems).toEqual(["blurry"]);
  });
});
