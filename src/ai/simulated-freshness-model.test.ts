import { describe, expect, it } from "vitest";
import { eyeScore } from "@/domain/freshness-score";
import { ModelCannotAssessError } from "./freshness-model";
import { SAMPLE_PHOTOS } from "./sample-photos";
import { createSimulatedFreshnessModel } from "./simulated-freshness-model";

const model = createSimulatedFreshnessModel({ latencyMs: 0 });

describe("simulated freshness model", () => {
  it("ranks sample eyes in the order of their dataset labels", async () => {
    const scores: Record<string, number[]> = { very_fresh: [], fresh: [], not_fresh: [] };
    for (const photo of SAMPLE_PHOTOS) {
      const probabilities = await model.assessEye({ kind: "sample", sampleId: photo.id });
      scores[photo.trueEyeClass].push(eyeScore(probabilities));
    }
    expect(Math.min(...scores.very_fresh)).toBeGreaterThan(Math.max(...scores.fresh));
    expect(Math.min(...scores.fresh)).toBeGreaterThan(Math.max(...scores.not_fresh));
  });

  it("is deterministic for the same sample", async () => {
    const photo = { kind: "sample" as const, sampleId: "segar-1" };
    expect(await model.assessEye(photo)).toEqual(await model.assessEye(photo));
  });

  it("refuses to pretend it can judge a captured photo", async () => {
    const capture = { kind: "capture" as const, pixels: { width: 1, height: 1, data: new Uint8ClampedArray(4) } };
    expect(model.canAssessEye(capture)).toBe(false);
    await expect(model.assessEye(capture)).rejects.toBeInstanceOf(ModelCannotAssessError);
  });

  it("leaves gills to people until gill samples exist", () => {
    expect(model.canAssessGill({ kind: "sample", sampleId: "sangat-segar-1" })).toBe(false);
  });
});
