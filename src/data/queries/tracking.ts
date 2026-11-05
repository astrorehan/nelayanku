import { auditHash } from "@/domain/audit-hash";
import { gradingAuditRecord } from "../grading-record";
import type { DemoDatabase } from "../types";
import { batchViewByCode } from "./batches";

export function publicBatchTrace(db: DemoDatabase, code: string, now: Date) {
  const view = batchViewByCode(db, code, now);
  if (!view) return null;
  return {
    code: view.batch.code,
    status: view.batch.status,
    species: view.species.name,
    kub: db.kub.name,
    regency: db.kub.regency,
    port: db.kub.port,
    kg: view.filledKg,
    grade: view.batchGrade,
    score: view.averageScore,
    parameters: view.averageParameters,
    iced: view.allIced && view.contributions.length > 0,
    landedAt: view.earliestLandedAt,
    departedAt: view.batch.departedAt,
    receivedAt: view.receipt?.receivedAt ?? null,
    simulated: true,
    contributions: view.contributions.map(({ fisher, landing, grading, kg }) => ({
      fisherLabel: `Nelayan #${fisher.memberNumber}`,
      kg,
      grade: grading.grade,
      score: grading.finalScore,
      parameters: grading.parameters,
      landedAt: landing.landedAt,
      iced: landing.iced,
      modelVersion: grading.modelVersion,
      overrideReason: grading.overrideReason,
      auditHash: grading.auditHash,
      hashMatches: grading.auditHash === auditHash(gradingAuditRecord(landing, grading)),
    })),
  };
}

export type PublicBatchTrace = NonNullable<ReturnType<typeof publicBatchTrace>>;

export function parseTrackingCode(input: string): string | null {
  const trimmed = input.trim();
  let code = trimmed;
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const path = new URL(trimmed).pathname;
      const match = path.match(/^\/lacak\/([^/]+)\/?$/);
      if (!match) return null;
      code = decodeURIComponent(match[1]);
    } catch {
      return null;
    }
  }
  return /^[a-z0-9-]{3,80}$/i.test(code) ? code.toUpperCase() : null;
}
