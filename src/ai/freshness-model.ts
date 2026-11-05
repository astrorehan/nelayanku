import type { EyeProbabilities, GillProbabilities } from "@/domain/freshness-score";
import type { PixelBuffer } from "./image-quality";

export type FreshnessModelKind = "simulated" | "onnx";

export type PhotoInput = { kind: "sample"; sampleId: string } | { kind: "capture"; pixels: PixelBuffer };

export interface FreshnessModel {
  readonly kind: FreshnessModelKind;
  readonly version: string;
  canAssessEye(photo: PhotoInput): boolean;
  canAssessGill(photo: PhotoInput): boolean;
  assessEye(photo: PhotoInput): Promise<EyeProbabilities>;
  assessGill(photo: PhotoInput): Promise<GillProbabilities>;
}

export class ModelCannotAssessError extends Error {
  constructor(part: "eye" | "gill") {
    super(`The ${part} photo cannot be assessed by this model`);
    this.name = "ModelCannotAssessError";
  }
}
