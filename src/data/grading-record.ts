import { auditHash } from "@/domain/audit-hash";
import {
  finalScore,
  gradeFromParameters,
  ODOR_SCORE,
  TEXTURE_SCORE,
  type EyeProbabilities,
  type GillProbabilities,
  type OdorOption,
  type ParameterScores,
  type TextureOption,
} from "@/domain/freshness-score";
import type { Grade } from "@/domain/grade";
import type { AssessmentSource, Grading, Landing } from "./types";

export function gradingAuditRecord(landing: Landing, grading: Omit<Grading, "auditHash">) {
  return {
    landingId: landing.id,
    speciesId: landing.speciesId,
    weightKg: landing.weightKg,
    landedAt: landing.landedAt,
    iced: landing.iced,
    parameters: { ...grading.parameters },
    finalScore: grading.finalScore,
    grade: grading.grade,
    modelVersion: grading.modelVersion,
    gradedAt: grading.gradedAt,
    ...(grading.overrideReason ? { overrideReason: grading.overrideReason } : {}),
  };
}

export function sealGrading(landing: Landing, grading: Omit<Grading, "auditHash">): Grading {
  return { ...grading, auditHash: auditHash(gradingAuditRecord(landing, grading)) };
}

export function buildGradingFromParameters(params: {
  landing: Landing;
  parameters: ParameterScores;
  odor: OdorOption;
  texture: TextureOption;
  eye: EyeProbabilities | null;
  gill: GillProbabilities | null;
  eyeSource: AssessmentSource;
  gillSource: AssessmentSource;
  modelVersion: string;
  gradedAt: string;
}): Grading {
  const grade: Grade = gradeFromParameters(params.parameters, params.odor);
  return sealGrading(params.landing, {
    id: `penilaian-${params.landing.id}`,
    landingId: params.landing.id,
    eye: params.eye,
    gill: params.gill,
    eyeSource: params.eyeSource,
    gillSource: params.gillSource,
    odor: params.odor,
    texture: params.texture,
    parameters: params.parameters,
    finalScore: finalScore(params.parameters),
    modelGrade: grade,
    grade,
    overrideReason: null,
    modelVersion: params.modelVersion,
    gradedAt: params.gradedAt,
  });
}

export function humanParameterScores(odor: OdorOption, texture: TextureOption) {
  return { odor: ODOR_SCORE[odor], texture: TEXTURE_SCORE[texture] };
}
