import { auditHash } from "@/domain/audit-hash";
import {
  freshClockStatus,
  minutesSince,
  remainingFreshMinutes,
} from "@/domain/cold-chain";
import { gradingAuditRecord } from "../grading-record";
import type { DemoDatabase } from "../types";
import { batchViewByCode } from "./batches";

export function publicBatchTrace(db: DemoDatabase, code: string, now: Date) {
  const view = batchViewByCode(db, code, now);
  if (!view) return null;
  const landed = view.earliestLandedAt
    ? new Date(view.earliestLandedAt)
    : null;
  const endedAt = view.receipt?.receivedAt ?? null;
  const coldEnd = endedAt ? new Date(endedAt) : now;
  const window = view.species.freshnessWindow;
  return {
    code: view.batch.code,
    status: view.batch.status,
    species: view.species.name,
    kub: db.kub.name,
    regency: db.kub.regency,
    port: db.kub.port,
    kg: view.filledKg,
    targetKg: view.targetKg,
    isFull: view.isFull,
    grade: view.batchGrade,
    score: view.averageScore,
    parameters: view.averageParameters,
    iced: view.allIced && view.contributions.length > 0,
    landedAt: view.earliestLandedAt,
    departedAt: view.batch.departedAt,
    receivedAt: endedAt,
    gradedAt: view.contributions.length
      ? view.contributions
          .map((item) => item.grading.gradedAt)
          .reduce((latest, at) => (at > latest ? at : latest))
      : null,
    labelledAt: view.batch.labelledAt,
    // Only the decision and kilos leave this query; the reason and note the
    // receiver typed stay in the KUB record.
    receipt: view.receipt
      ? {
          decision: view.receipt.decision,
          acceptedKg: view.receipt.acceptedKg,
        }
      : null,
    cold: landed
      ? {
          elapsedMinutes: minutesSince(landed, coldEnd),
          windowMinutes:
            (view.allIced ? window.icedHours : window.unicedHours) * 60,
          remainingMinutes: remainingFreshMinutes(
            landed,
            coldEnd,
            window,
            view.allIced,
          ),
          status: freshClockStatus(landed, coldEnd, window, view.allIced),
          measuredAtReceipt: endedAt !== null,
        }
      : null,
    simulated: true,
    contributions: view.contributions.map(
      ({ fisher, landing, grading, kg }) => ({
        fisherLabel: `Nelayan #${fisher.memberNumber}`,
        kg,
        share: view.filledKg > 0 ? kg / view.filledKg : 0,
        grade: grading.grade,
        score: grading.finalScore,
        parameters: grading.parameters,
        landedAt: landing.landedAt,
        iced: landing.iced,
        modelVersion: grading.modelVersion,
        gradeAdjusted: Boolean(grading.overrideReason),
        auditHash: grading.auditHash,
        hashMatches:
          grading.auditHash === auditHash(gradingAuditRecord(landing, grading)),
      }),
    ),
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

export function publicMaterialTrace(db: DemoDatabase, materialId: string) {
  const material = db.materials.find(
    (candidate) => candidate.id === materialId,
  );
  const landing = material
    ? db.landings.find((candidate) => candidate.id === material.landingId)
    : null;
  const grading = landing
    ? db.gradings.find((candidate) => candidate.landingId === landing.id)
    : null;
  if (!material || !landing || !grading) return null;
  return {
    species: db.species.find((candidate) => candidate.id === landing.speciesId)!
      .name,
    kub: db.kub.name,
    port: db.kub.port,
    regency: db.kub.regency,
    fisherLabel: `Nelayan #${db.fishers.find((candidate) => candidate.id === landing.fisherId)!.memberNumber}`,
    kg: material.kg,
    grade: grading.grade,
    score: grading.finalScore,
    parameters: grading.parameters,
    landedAt: landing.landedAt,
    gradedAt: grading.gradedAt,
    iced: landing.iced,
    auditHash: grading.auditHash,
  };
}

// The processed-material card on /lacak points at the material that a seeded
// product actually came from, so the link is never a guess.
export function materialExample(db: DemoDatabase) {
  for (const product of db.products) {
    if (!product.materialId) continue;
    const trace = publicMaterialTrace(db, product.materialId);
    if (trace)
      return {
        id: product.materialId,
        species: trace.species,
        kg: trace.kg,
        grade: trace.grade,
        productName: product.name,
      };
  }
  return null;
}

export type TimelineState = "done" | "current" | "pending" | "failed";

export interface TimelineStep {
  id: "landed" | "graded" | "full" | "departed" | "received";
  label: string;
  state: TimelineState;
  at: string | null;
  detail: string;
}

const PAST_FULL = new Set(["full", "labelled", "in_transit", "received", "rejected"]);

export function traceTimeline(trace: PublicBatchTrace): TimelineStep[] {
  const hasFish = trace.contributions.length > 0;
  const cancelled = trace.status === "cancelled";
  const pastFull = PAST_FULL.has(trace.status);
  const received =
    trace.status === "received" && trace.receipt
      ? trace.receipt.decision === "accept_partial"
        ? "Diterima sebagian"
        : "Diterima"
      : null;
  const steps: TimelineStep[] = [
    {
      id: "landed",
      label: "Mendarat",
      state: hasFish ? "done" : "pending",
      at: trace.landedAt,
      detail: hasFish
        ? `${trace.contributions.length} catatan nelayan, ${trace.iced ? "semua pakai es" : "ada yang tanpa es"}`
        : "Belum ada ikan masuk",
    },
    {
      id: "graded",
      label: "Dinilai",
      state: hasFish ? "done" : "pending",
      at: trace.gradedAt,
      detail: trace.grade ? `Mutu kiriman ${trace.grade}` : "Belum dinilai",
    },
    {
      id: "full",
      label: cancelled ? "Dibatalkan" : "Penuh",
      state: cancelled ? "failed" : pastFull ? "done" : "pending",
      at: trace.labelledAt,
      detail: cancelled
        ? "Pesanan dibatalkan sebelum penuh"
        : pastFull
          ? trace.isFull
            ? `${trace.kg} dari ${trace.targetKg} kg terisi`
            : `Dikirim sebagian, ${trace.kg} dari ${trace.targetKg} kg`
          : `Mengisi ${trace.kg} dari ${trace.targetKg} kg`,
    },
    {
      id: "departed",
      label: "Berangkat",
      state: trace.departedAt ? "done" : "pending",
      at: trace.departedAt,
      detail: trace.departedAt
        ? "Peti berlabel dibawa kurir"
        : "Belum berangkat",
    },
    {
      id: "received",
      label: trace.status === "rejected" ? "Ditolak" : (received ?? "Diterima"),
      state:
        trace.status === "rejected" ? "failed" : received ? "done" : "pending",
      at: trace.receivedAt,
      detail:
        trace.status === "rejected"
          ? "Seluruh kiriman ditolak pembeli"
          : received && trace.receipt
            ? `${trace.receipt.acceptedKg} dari ${trace.kg} kg diterima`
            : "Menunggu pembeli",
    },
  ];
  if (cancelled || !hasFish) return steps;
  const firstOpen = steps.findIndex((step) => step.state === "pending");
  if (firstOpen >= 0)
    steps[firstOpen] = { ...steps[firstOpen], state: "current" };
  return steps;
}

export type ExampleOutcome = "in_transit" | "received" | "partial" | "rejected";

export interface TraceExample {
  code: string;
  outcome: ExampleOutcome;
  species: string;
  grade: PublicBatchTrace["grade"];
  kg: number;
  acceptedKg: number | null;
  fishers: number;
}

const EXAMPLE_ORDER: ExampleOutcome[] = [
  "in_transit",
  "received",
  "partial",
  "rejected",
];

// Labels come from the data itself, so a batch the tour has since received
// never keeps a stale "di jalan" caption.
export function traceExamples(db: DemoDatabase, now: Date): TraceExample[] {
  const traces = db.batches
    .map((batch) => publicBatchTrace(db, batch.code, now))
    .filter((trace): trace is PublicBatchTrace => trace !== null)
    .filter((trace) => trace.contributions.length > 0);
  const outcomeOf = (trace: PublicBatchTrace): ExampleOutcome | null => {
    if (trace.status === "in_transit" || trace.status === "rejected")
      return trace.status;
    if (trace.status !== "received") return null;
    return trace.receipt?.decision === "accept_partial" ? "partial" : "received";
  };
  const examples: TraceExample[] = [];
  for (const outcome of EXAMPLE_ORDER) {
    // Prefer a shipment built from several fishers (best for the anonymous
    // contribution bars); later batches win ties.
    const best = traces
      .filter((trace) => outcomeOf(trace) === outcome)
      .reduce<PublicBatchTrace | null>(
        (top, trace) =>
          !top || trace.contributions.length >= top.contributions.length
            ? trace
            : top,
        null,
      );
    if (!best) continue;
    examples.push({
      code: best.code,
      outcome,
      species: best.species,
      grade: best.grade,
      kg: best.kg,
      acceptedKg: best.receipt?.acceptedKg ?? null,
      fishers: best.contributions.length,
    });
  }
  return examples;
}
