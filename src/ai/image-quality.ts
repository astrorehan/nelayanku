export interface PixelBuffer {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export type QualityProblem = "too_dark" | "glare" | "blurry";

export interface QualityReport {
  meanLuminance: number;
  glareShare: number;
  sharpness: number;
  problems: QualityProblem[];
}

export const TOO_DARK_BELOW_LUMINANCE = 65;
export const GLARE_ABOVE_SHARE = 0.25;
export const BLURRY_BELOW_SHARPNESS = 70;
const GLARE_LUMINANCE = 245;

export function toGrayscale({ width, height, data }: PixelBuffer): Float32Array {
  const gray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    gray[i] = 0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2];
  }
  return gray;
}

export function laplacianVariance(gray: Float32Array, width: number, height: number): number {
  let sum = 0;
  let sumOfSquares = 0;
  let count = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const value = gray[i - width] + gray[i + width] + gray[i - 1] + gray[i + 1] - 4 * gray[i];
      sum += value;
      sumOfSquares += value * value;
      count++;
    }
  }
  if (count === 0) {
    return 0;
  }
  const mean = sum / count;
  return sumOfSquares / count - mean * mean;
}

export function assessImageQuality(pixels: PixelBuffer): QualityReport {
  const gray = toGrayscale(pixels);
  let total = 0;
  let glarePixels = 0;
  for (const value of gray) {
    total += value;
    if (value > GLARE_LUMINANCE) {
      glarePixels++;
    }
  }
  const meanLuminance = total / gray.length;
  const glareShare = glarePixels / gray.length;
  const sharpness = laplacianVariance(gray, pixels.width, pixels.height);
  const problems: QualityProblem[] = [];
  if (meanLuminance < TOO_DARK_BELOW_LUMINANCE) {
    problems.push("too_dark");
  }
  if (glareShare > GLARE_ABOVE_SHARE) {
    problems.push("glare");
  }
  if (sharpness < BLURRY_BELOW_SHARPNESS) {
    problems.push("blurry");
  }
  return { meanLuminance, glareShare, sharpness, problems };
}
