import { describe, expect, it } from "vitest";
import { auditHash } from "@/domain/audit-hash";
import { sppgIneligibilityReason } from "@/domain/cold-chain";
import { isGradeAtLeast } from "@/domain/grade";
import { createSeedDatabase } from "./index";
import { TODAY_TONGKOL_BATCH_ID } from "./today";

const db = createSeedDatabase();
const landingById = new Map(db.landings.map((landing) => [landing.id, landing]));
const gradingByLanding = new Map(db.gradings.map((grading) => [grading.landingId, grading]));
const orderById = new Map(db.orders.map((order) => [order.id, order]));
const batchById = new Map(db.batches.map((batch) => [batch.id, batch]));

describe("seed database", () => {
  it("is deterministic", () => {
    expect(JSON.stringify(createSeedDatabase())).toBe(JSON.stringify(db));
  });

  it("only links batch items to real landings without overfilling them", () => {
    const batchedPerLanding = new Map<string, number>();
    for (const item of db.batchItems) {
      expect(landingById.has(item.landingId)).toBe(true);
      expect(batchById.has(item.batchId)).toBe(true);
      batchedPerLanding.set(item.landingId, (batchedPerLanding.get(item.landingId) ?? 0) + item.kg);
    }
    for (const [landingId, kg] of batchedPerLanding) {
      expect(kg).toBeLessThanOrEqual(landingById.get(landingId)!.weightKg);
    }
  });

  it("never puts fish below the order grade into a batch", () => {
    for (const item of db.batchItems) {
      const order = orderById.get(batchById.get(item.batchId)!.orderId)!;
      const grading = gradingByLanding.get(item.landingId)!;
      expect(isGradeAtLeast(grading.grade, order.minimumGrade)).toBe(true);
    }
  });

  it("never breaks the histamine rule in SPPG batches", () => {
    const sppgBuyerIds = new Set(db.buyers.filter((buyer) => buyer.kind === "sppg").map((buyer) => buyer.id));
    for (const item of db.batchItems) {
      const order = orderById.get(batchById.get(item.batchId)!.orderId)!;
      if (!sppgBuyerIds.has(order.buyerId)) {
        continue;
      }
      const landing = landingById.get(item.landingId)!;
      const species = db.species.find((candidate) => candidate.id === landing.speciesId)!;
      expect(
        sppgIneligibilityReason({
          histamineRisk: species.histamineRisk,
          iced: landing.iced,
          landedAt: new Date(landing.landedAt),
          now: new Date(order.deliverAt),
          window: species.freshnessWindow,
        }),
      ).toBeNull();
    }
  });

  it("stores audit hashes that recompute from the graded record", () => {
    for (const grading of db.gradings) {
      const landing = landingById.get(grading.landingId)!;
      expect(
        auditHash({
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
        }),
      ).toBe(grading.auditHash);
    }
  });

  it("starts today's tongkol order at 22 of 40 kg from Joni and Herman", () => {
    const items = db.batchItems.filter((item) => item.batchId === TODAY_TONGKOL_BATCH_ID);
    expect(items.reduce((sum, item) => sum + item.kg, 0)).toBe(22);
    expect(items.map((item) => landingById.get(item.landingId)!.fisherId).sort()).toEqual([
      "nelayan-herman",
      "nelayan-joni",
    ]);
  });

  it("leaves Pak Zainal's uniced tongkol ungraded as the morning alert", () => {
    const zainal = db.landings.find((landing) => landing.id === "darat-2026-11-05-zainal")!;
    expect(zainal.iced).toBe(false);
    expect(gradingByLanding.has(zainal.id)).toBe(false);
  });

  it("gives Pak Darman Rp2.800.000 of approved debt and one pending installment", () => {
    const entries = db.ledger.filter((entry) => entry.fisherId === "nelayan-darman");
    const loans = entries.filter((entry) => entry.kind === "loan").reduce((sum, entry) => sum + entry.amount, 0);
    const approvedInstallments = entries
      .filter((entry) => entry.kind === "installment" && entry.approval !== "pending")
      .reduce((sum, entry) => sum + entry.amount, 0);
    expect(loans - approvedInstallments).toBe(2800000);
    expect(entries.filter((entry) => entry.approval === "pending").map((entry) => entry.amount)).toEqual([50000]);
  });

  it("records exactly one late payment so the on-time rate is earned, not perfect", () => {
    expect(db.payments.filter((payment) => payment.status === "late")).toHaveLength(1);
  });
});
