import type { Grade } from "./grade";

export interface EyeProbabilities {
  veryFresh: number;
  fresh: number;
  notFresh: number;
}

export interface GillProbabilities {
  fresh: number;
  notFresh: number;
}

export const ODOR_OPTIONS = ["sea_fresh", "neutral", "sour", "rotten"] as const;
export type OdorOption = (typeof ODOR_OPTIONS)[number];

export const TEXTURE_OPTIONS = ["firm", "slightly_soft", "soft", "very_soft"] as const;
export type TextureOption = (typeof TEXTURE_OPTIONS)[number];

export const ODOR_SCORE: Record<OdorOption, number> = {
  sea_fresh: 9,
  neutral: 7,
  sour: 5,
  rotten: 1,
};

export const TEXTURE_SCORE: Record<TextureOption, number> = {
  firm: 9,
  slightly_soft: 7,
  soft: 5,
  very_soft: 3,
};

export const PRIME_MINIMUM_FINAL_SCORE = 8;
export const PRIME_MINIMUM_PARAMETER_SCORE = 7;
export const SNI_MINIMUM_FINAL_SCORE = 7;
export const PROCESSING_MINIMUM_FINAL_SCORE = 5;
export const ASSESSED_PARAMETER_COUNT = 4;
export const SNI_PARAMETER_COUNT = 6;

export interface ParameterScores {
  eye: number;
  gill: number;
  odor: number;
  texture: number;
}

export interface FreshnessInput {
  eye: EyeProbabilities;
  gill: GillProbabilities;
  odor: OdorOption;
  texture: TextureOption;
}

export interface FreshnessAssessment {
  parameters: ParameterScores;
  finalScore: number;
  grade: Grade;
}

export function roundToOneDecimal(value: number): number {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

function normalized<T extends Record<string, number>>(probabilities: T): T {
  const values = Object.values(probabilities);
  if (values.some((value) => value < 0 || !Number.isFinite(value))) {
    throw new Error("Probabilities must be finite and non-negative");
  }
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total === 0) {
    throw new Error("Probabilities must not all be zero");
  }
  return Object.fromEntries(
    Object.entries(probabilities).map(([key, value]) => [key, value / total]),
  ) as T;
}

export function eyeScore(probabilities: EyeProbabilities): number {
  const p = normalized(probabilities);
  return roundToOneDecimal(9 * p.veryFresh + 7 * p.fresh + 5 * p.notFresh);
}

export function gillScore(probabilities: GillProbabilities): number {
  const p = normalized(probabilities);
  return roundToOneDecimal(5 + 4 * p.fresh);
}

export function finalScore(parameters: ParameterScores): number {
  const { eye, gill, odor, texture } = parameters;
  return roundToOneDecimal((eye + gill + odor + texture) / ASSESSED_PARAMETER_COUNT);
}

export function gradeFromParameters(parameters: ParameterScores, odor: OdorOption): Grade {
  const score = finalScore(parameters);
  if (odor === "rotten" || score < PROCESSING_MINIMUM_FINAL_SCORE) {
    return "REJECT";
  }
  const lowestParameter = Math.min(...Object.values(parameters));
  if (score >= PRIME_MINIMUM_FINAL_SCORE && lowestParameter >= PRIME_MINIMUM_PARAMETER_SCORE) {
    return "A";
  }
  if (score >= SNI_MINIMUM_FINAL_SCORE) {
    return "B";
  }
  return "C";
}

export function assessFreshness(input: FreshnessInput): FreshnessAssessment {
  const parameters: ParameterScores = {
    eye: eyeScore(input.eye),
    gill: gillScore(input.gill),
    odor: ODOR_SCORE[input.odor],
    texture: TEXTURE_SCORE[input.texture],
  };
  return {
    parameters,
    finalScore: finalScore(parameters),
    grade: gradeFromParameters(parameters, input.odor),
  };
}
