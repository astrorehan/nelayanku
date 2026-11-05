import type { EyeProbabilities, GillProbabilities } from "@/domain/freshness-score";
import { ModelCannotAssessError, type FreshnessModel, type PhotoInput } from "./freshness-model";
import { samplePhotoById, type EyeFreshnessClass } from "./sample-photos";

export const SIMULATED_MODEL_VERSION = "kesegaran-simulasi-0.1";

const EYE_PROFILE: Record<EyeFreshnessClass, EyeProbabilities> = {
  very_fresh: { veryFresh: 0.82, fresh: 0.15, notFresh: 0.03 },
  fresh: { veryFresh: 0.18, fresh: 0.71, notFresh: 0.11 },
  not_fresh: { veryFresh: 0.04, fresh: 0.22, notFresh: 0.74 },
};

const SIMULATED_LATENCY_MS = 420;

function stableJitter(seed: string): number {
  let hash = 2166136261;
  for (const character of seed) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }
  return ((hash >>> 0) % 1000) / 1000 - 0.5;
}

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export function simulatedEyeProbabilities(sampleId: string, trueClass: EyeFreshnessClass): EyeProbabilities {
  const profile = EYE_PROFILE[trueClass];
  const shift = stableJitter(sampleId) * 0.08;
  const dominant = trueClass === "very_fresh" ? "veryFresh" : trueClass === "fresh" ? "fresh" : "notFresh";
  const neighbour = trueClass === "not_fresh" ? "fresh" : trueClass === "very_fresh" ? "fresh" : "veryFresh";
  return { ...profile, [dominant]: profile[dominant] + shift, [neighbour]: profile[neighbour] - shift };
}

export function createSimulatedFreshnessModel({ latencyMs = SIMULATED_LATENCY_MS } = {}): FreshnessModel {
  const knownSample = (photo: PhotoInput) => (photo.kind === "sample" ? samplePhotoById(photo.sampleId) : undefined);
  return {
    kind: "simulated",
    version: SIMULATED_MODEL_VERSION,
    canAssessEye: (photo) => knownSample(photo) !== undefined,
    canAssessGill: (photo) => knownSample(photo)?.gillImage != null,
    async assessEye(photo): Promise<EyeProbabilities> {
      const sample = knownSample(photo);
      if (!sample) {
        throw new ModelCannotAssessError("eye");
      }
      await wait(latencyMs);
      return simulatedEyeProbabilities(sample.id, sample.trueEyeClass);
    },
    async assessGill(photo): Promise<GillProbabilities> {
      if (knownSample(photo)?.gillImage == null) {
        throw new ModelCannotAssessError("gill");
      }
      await wait(latencyMs);
      return { fresh: 0.8, notFresh: 0.2 };
    },
  };
}
