import { describe, expect, it } from "vitest";
import {
  CommandRejectedError,
  decideDeduction,
  departBatch,
  labelBatch,
  overrideGrade,
  updateLanding,
  placeOrder,
  receiveBatch,
  recordLanding,
  routeLanding,
  saveGrading,
  type CommandContext,
} from "./commands";
import { DEMO_START } from "./demo-clock";
import { batchView } from "./queries/batches";
import { debtSummary, revenueShareForBatch } from "./queries/fishers";
import { landingOutcome, landingsOnDate, resumableLanding } from "./queries/landings";
import { createSeedDatabase } from "./seed";
import { TODAY_TONGKOL_BATCH_ID } from "./seed/today";
import type { DemoDatabase } from "./types";

function context(minutesAfterStart = 0): CommandContext {
  let counter = 0;
  return {
    now: new Date(DEMO_START.getTime() + minutesAfterStart * 60_000),
    actor: "Bu Sari",
    newId: (prefix) => `${prefix}-uji-${++counter}`,
  };
}

const primeGrading = {
  eye: { veryFresh: 0.8, fresh: 0.2, notFresh: 0 },
  gill: { fresh: 1, notFresh: 0 },
  eyeSource: "model" as const,
  gillSource: "person" as const,
  odor: "sea_fresh" as const,
  texture: "slightly_soft" as const,
  modelVersion: "kesegaran-simulasi-0.1",
};

function landAndGrade(db: DemoDatabase, weightKg: number, ctx: CommandContext) {
  const landed = recordLanding(db, { fisherId: "nelayan-darman", speciesId: "tongkol", weightKg, iced: true }, ctx);
  const graded = saveGrading(landed.db, { landingId: landed.result.id, ...primeGrading }, ctx);
  return { db: graded.db, landing: landed.result, grading: graded.result };
}

describe("a morning at the dock", () => {
  it("fills the tongkol order, ships it, and pays every fisher", () => {
    const ctx = context();
    const { db: graded, landing, grading } = landAndGrade(createSeedDatabase(), 18, ctx);
    expect(grading.grade).toBe("A");
    expect(grading.parameters).toEqual({ eye: 8.6, gill: 9, odor: 9, texture: 7 });

    const routed = routeLanding(graded, { landingId: landing.id, destination: "batch", batchId: TODAY_TONGKOL_BATCH_ID }, ctx);
    expect(routed.result).toEqual({ batchedKg: 18, leftoverKg: 0 });
    expect(batchView(routed.db, TODAY_TONGKOL_BATCH_ID, ctx.now)!.batch.status).toBe("full");

    const labelled = labelBatch(routed.db, { batchId: TODAY_TONGKOL_BATCH_ID }, ctx);
    const departed = departBatch(
      labelled.db,
      { batchId: TODAY_TONGKOL_BATCH_ID, checklist: { enoughIce: true, closedContainer: true, labelAttached: true, courier: "Pak Udin" } },
      ctx,
    );
    const received = receiveBatch(
      departed.db,
      { batchId: TODAY_TONGKOL_BATCH_ID, decision: "accept_all", acceptedKg: 40, reason: null, note: null, recheckScore: null },
      context(140),
    );
    const payment = received.db.payments.find((candidate) => candidate.batchId === TODAY_TONGKOL_BATCH_ID);
    expect(payment?.amount).toBe(800000);

    const share = revenueShareForBatch(received.db, TODAY_TONGKOL_BATCH_ID);
    const darman = share.lines.find((line) => line.fisherId === "nelayan-darman")!;
    expect(darman.gross).toBe(293400);
    expect(darman.pendingDeduction).toBe(50000);

    const pending = debtSummary(received.db, "nelayan-darman").pending[0];
    const approved = decideDeduction(received.db, { entryId: pending.id, approve: true, via: "link" }, ctx);
    expect(revenueShareForBatch(approved.db, TODAY_TONGKOL_BATCH_ID).lines.find((line) => line.fisherId === "nelayan-darman")!.net).toBe(
      243400,
    );
    expect(debtSummary(approved.db, "nelayan-darman").outstanding).toBe(2750000);
  });

  it("puts only what the order still needs into the batch and leaves the rest for TPI", () => {
    const ctx = context();
    const { db, landing } = landAndGrade(createSeedDatabase(), 25, ctx);
    const routed = routeLanding(db, { landingId: landing.id, destination: "batch", batchId: TODAY_TONGKOL_BATCH_ID }, ctx);
    expect(routed.result).toEqual({ batchedKg: 18, leftoverKg: 7 });
  });

  it("refuses to sell rejected fish", () => {
    const ctx = context();
    const landed = recordLanding(createSeedDatabase(), { fisherId: "nelayan-darman", speciesId: "tongkol", weightKg: 5, iced: true }, ctx);
    const graded = saveGrading(landed.db, { landingId: landed.result.id, ...primeGrading, odor: "rotten" }, ctx);
    expect(graded.result.grade).toBe("REJECT");
    expect(() =>
      routeLanding(graded.db, { landingId: landed.result.id, destination: "batch", batchId: TODAY_TONGKOL_BATCH_ID }, ctx),
    ).toThrow(CommandRejectedError);
    expect(() => routeLanding(graded.db, { landingId: landed.result.id, destination: "port_auction" }, ctx)).toThrow(
      CommandRejectedError,
    );
  });

  it("lets the operator fix a landing until it is graded", () => {
    const ctx = context();
    const landed = recordLanding(createSeedDatabase(), { fisherId: "nelayan-darman", speciesId: "tongkol", weightKg: 81, iced: true }, ctx);
    const fixed = updateLanding(landed.db, { landingId: landed.result.id, weightKg: 18, fisherId: "nelayan-rusdi" }, ctx);
    expect(fixed.result.weightKg).toBe(18);
    expect(fixed.result.fisherId).toBe("nelayan-rusdi");
    const graded = saveGrading(fixed.db, { landingId: landed.result.id, ...primeGrading }, ctx);
    expect(() => updateLanding(graded.db, { landingId: landed.result.id, weightKg: 20 }, ctx)).toThrow(CommandRejectedError);
  });

  it("records a grade override with its reason and a new audit hash", () => {
    const ctx = context();
    const { db, landing, grading } = landAndGrade(createSeedDatabase(), 10, ctx);
    expect(() => overrideGrade(db, { landingId: landing.id, grade: "B", reason: " " }, ctx)).toThrow(CommandRejectedError);
    const overridden = overrideGrade(db, { landingId: landing.id, grade: "B", reason: "Ada memar" }, ctx);
    expect(overridden.result.grade).toBe("B");
    expect(overridden.result.modelGrade).toBe("A");
    expect(overridden.result.auditHash).not.toBe(grading.auditHash);
    expect(overridden.db.auditLog.at(-1)?.detail).toBe("A → B: Ada memar");
  });

  it("blocks departure until the shipping checklist is complete", () => {
    const ctx = context();
    const labelled = labelBatch(createSeedDatabase(), { batchId: TODAY_TONGKOL_BATCH_ID }, ctx);
    expect(() =>
      departBatch(
        labelled.db,
        { batchId: TODAY_TONGKOL_BATCH_ID, checklist: { enoughIce: true, closedContainer: false, labelAttached: true, courier: "Pak Udin" } },
        ctx,
      ),
    ).toThrow(CommandRejectedError);
  });

  it("opens a batch with a readable code for a new order", () => {
    const ctx = context();
    const placed = placeOrder(
      createSeedDatabase(),
      {
        buyerId: "pembeli-sppg-kampung-melayu",
        speciesId: "tongkol",
        minimumGrade: "A",
        targetKg: 40,
        pricePerKg: 20000,
        deliverAt: "2026-11-06T08:00:00+07:00",
        address: "Jl. Sumber Jaya No. 12",
      },
      ctx,
    );
    const batch = placed.db.batches.find((candidate) => candidate.orderId === placed.result.id)!;
    expect(batch.code).toBe("TGK-A-0611");
    expect(batch.status).toBe("filling");
  });

  it("tells the operator what happened to Pak Darman's 18 kg and what he can expect to receive", () => {
    const ctx = context(2);
    const landed = recordLanding(createSeedDatabase(), { fisherId: "nelayan-darman", speciesId: "tongkol", weightKg: 18, iced: true }, ctx);
    expect(resumableLanding(landed.db, landed.result.id)?.id).toBe(landed.result.id);
    const graded = saveGrading(landed.db, { landingId: landed.result.id, ...primeGrading }, ctx);
    const routed = routeLanding(
      graded.db,
      { landingId: landed.result.id, destination: "batch", batchId: TODAY_TONGKOL_BATCH_ID },
      ctx,
    );
    expect(resumableLanding(routed.db, landed.result.id)).toBeNull();
    const outcome = landingOutcome(routed.db, landed.result.id, ctx.now)!;
    expect(outcome.batchedKg).toBe(18);
    expect(outcome.leftoverKg).toBe(0);
    expect(outcome.batch?.isFull).toBe(true);
    expect(outcome.payoutEstimate).toBe(293400);
  });

  it("stores new times in the same +07:00 form as the seed so lists stay in time order", () => {
    const ctx = context(3);
    const landed = recordLanding(createSeedDatabase(), { fisherId: "nelayan-darman", speciesId: "tongkol", weightKg: 18, iced: true }, ctx);
    expect(landed.result.landedAt).toBe("2026-11-05T05:44:00+07:00");
    expect(landingsOnDate(landed.db, "2026-11-05")[0].landing.id).toBe(landed.result.id);
  });
});
