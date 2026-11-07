import { describe, expect, it } from "vitest";
import { fairFisherPriceRange } from "@/domain/pricing";
import { DEMO_START } from "../demo-clock";
import { createSeedDatabase } from "../seed";
import { TODAY_CAKALANG_BATCH_ID, TODAY_TONGKOL_BATCH_ID } from "../seed/today";
import { batchView, batchViewByCode, recentCouriers, sppgBlockReason, suggestedBatches } from "./batches";
import { destinationPlan, estimatedPayout, fairPriceFor, processingPricePerKg } from "./destinations";
import { batchPayouts, debtSummary, fishersWithDebt, installmentAwaitingPayment, payoutsFor, revenueShareForBatch } from "./fishers";
import { impactMetrics } from "./impact";
import { freshnessAlerts } from "./landings";
import { buyerPriceGuide, nextDeliveryDate } from "./ordering";
import { averagePortPrice, movingAverage } from "./prices";

const db = createSeedDatabase();

describe("batch queries", () => {
  it("shows today's tongkol order at 22 of 40 kg with the fresh clock running from the first landing", () => {
    const view = batchView(db, TODAY_TONGKOL_BATCH_ID, DEMO_START)!;
    expect(view.filledKg).toBe(22);
    expect(view.remainingKg).toBe(18);
    expect(view.batchGrade).toBe("A");
    expect(view.breakdown.fisherReceivesPerKg).toBe(16300);
    expect(view.freshRemainingMinutes).toBe(444);
  });

  it("offers the couriers who carried recent shipments first", () => {
    expect(recentCouriers(db)[0]).toBe("Pak Udin");
  });

  it("finds a batch by the code printed on its label", () => {
    expect(batchViewByCode(db, "ckl-b-0511", DEMO_START)?.batch.id).toBe(TODAY_CAKALANG_BATCH_ID);
  });

  it("suggests today's tongkol order for an iced grade A tongkol", () => {
    const suggestions = suggestedBatches(
      db,
      { speciesId: "tongkol", grade: "A", iced: true, landedAt: DEMO_START.toISOString() },
      DEMO_START,
    );
    expect(suggestions[0].batch.id).toBe(TODAY_TONGKOL_BATCH_ID);
  });

  it("keeps uniced tongkol away from SPPG orders", () => {
    expect(sppgBlockReason(db, { speciesId: "tongkol", iced: false, landedAt: DEMO_START.toISOString() }, DEMO_START)).toBe(
      "no_ice",
    );
    expect(
      suggestedBatches(db, { speciesId: "tongkol", grade: "A", iced: false, landedAt: DEMO_START.toISOString() }, DEMO_START),
    ).toEqual([]);
  });
});

describe("fisher queries", () => {
  it("lists received shipments newest first with each fisher's share after approved installments", () => {
    const [latest] = batchPayouts(db, DEMO_START);
    const darman = latest.share.lines.find((line) => line.fisherId === "nelayan-darman")!;
    expect(latest.view.receipt?.receivedAt.slice(0, 10)).toBe("2026-11-04");
    expect(darman.net).toBe(258600);
  });

  it("counts an approved installment as repaid only after the buyer pays", () => {
    const approved = {
      ...db,
      ledger: db.ledger.map((entry) => (entry.approval === "pending" ? { ...entry, approval: "approved_verbally" as const } : entry)),
    };
    const beforePayment = debtSummary(approved, "nelayan-darman");
    expect(beforePayment.outstanding).toBe(2800000);
    expect(beforePayment.scheduled.map((entry) => entry.amount)).toEqual([50000]);
    const paid = {
      ...approved,
      payments: [
        ...approved.payments,
        { batchId: TODAY_TONGKOL_BATCH_ID, amount: 800000, dueAt: "2026-11-06T09:00:00+07:00", paidAt: "2026-11-05T09:10:00+07:00", status: "paid" as const },
      ],
    };
    expect(debtSummary(paid, "nelayan-darman").outstanding).toBe(2750000);
  });

  it("finds the installment a fisher still has to decide on before the buyer pays", () => {
    expect(installmentAwaitingPayment(db, "nelayan-darman")).toMatchObject({ amount: 50000, approval: "pending" });
    expect(installmentAwaitingPayment(db, "nelayan-rusdi")).toBeNull();
  });

  it("lists only fishers who carry a debt, largest first", () => {
    expect(fishersWithDebt(db).map((entry) => entry.fisher.name)).toEqual(["Darman", "Rusdi"]);
  });

  it("adds up Pak Darman's debt from loans and approved installments only", () => {
    const summary = debtSummary(db, "nelayan-darman");
    expect(summary.outstanding).toBe(2800000);
    expect(summary.repaid).toBe(200000);
    expect(summary.pending.map((entry) => entry.amount)).toEqual([50000]);
  });

  it("lists payouts net of approved installments", () => {
    const latest = payoutsFor(db, "nelayan-darman")[0];
    expect(latest.kg).toBe(22);
    expect(latest.gross).toBe(358600);
    expect(latest.net).toBe(258600);
  });

  it("recomputes yesterday's revenue share with the approved installment", () => {
    const share = revenueShareForBatch(db, "batch-2026-11-04-tongkol");
    expect(share.totalKg).toBe(40);
    expect(share.lines.find((line) => line.fisherId === "nelayan-darman")?.net).toBe(258600);
  });
});

describe("landing queries", () => {
  it("raises Pak Zainal's uniced tongkol as the most urgent alert", () => {
    const [first] = freshnessAlerts(db, DEMO_START);
    expect(first.view.fisher.name).toBe("Zainal");
    expect(first.remainingMinutes).toBe(50);
  });
});

describe("impact metrics", () => {
  const metrics = impactMetrics(db, { fromDate: "2026-10-06", toDate: "2026-11-04" });

  it("counts only received batches and earns the on-time rate from real payments", () => {
    expect(metrics.deliveredBatchCount).toBeGreaterThan(20);
    expect(metrics.onTimePayments.total - metrics.onTimePayments.onTime).toBe(2);
  });

  it("measures extra income against the port price, which should be positive", () => {
    expect(metrics.extraIncomeVsPortPrice).toBeGreaterThan(0);
  });

  it("accounts for every landed kilogram across destinations", () => {
    const landed = db.landings
      .filter((landing) => landing.destination && landing.landedAt < "2026-11-05")
      .reduce((sum, landing) => sum + landing.weightKg, 0);
    const routed = Object.values(metrics.destinationKg).reduce((sum, kg) => sum + kg, 0);
    expect(routed).toBe(landed);
  });
});

describe("price queries", () => {
  it("averages the last seven port prices to the nearest Rp50", () => {
    expect(averagePortPrice(db, "tongkol", "2026-11-04").pricePerKg % 50).toBe(0);
  });

  it("computes a trailing moving average", () => {
    expect(movingAverage([1, 2, 3, 4], 2)).toEqual([null, 1.5, 2.5, 3.5]);
  });
});

describe("destination plan", () => {
  const tongkol = (weightKg: number, iced: boolean) => ({
    speciesId: "tongkol" as const,
    weightKg,
    iced,
    landedAt: DEMO_START.toISOString(),
  });

  it("puts Pak Darman's iced 18 kg grade A tongkol into today's SPPG order and fills it", () => {
    const plan = destinationPlan(db, tongkol(18, true), "A", DEMO_START);
    expect(plan.recommended).toMatchObject({ kind: "batch", kg: 18, leftoverKg: 0 });
    expect(plan.alternatives.map((choice) => choice.kind)).toEqual(["port_auction"]);
    expect(plan.sppgBlock).toBeNull();
    expect(estimatedPayout(plan.recommended)).toBe(293400);
  });

  it("splits a landing that is heavier than what the order still needs", () => {
    const plan = destinationPlan(db, tongkol(25, true), "A", DEMO_START);
    expect(plan.recommended).toMatchObject({ kind: "batch", kg: 18, leftoverKg: 7 });
  });

  it("sends uniced tongkol to the port auction and says which SPPG order it cannot join", () => {
    const plan = destinationPlan(db, tongkol(9, false), "A", DEMO_START);
    expect(plan.recommended.kind).toBe("port_auction");
    expect(plan.sppgBlock).toEqual({ reason: "no_ice", buyerName: "Dapur SPPG Kampung Melayu" });
  });

  it("turns grade C into processing material priced like the market does", () => {
    const plan = destinationPlan(db, tongkol(12, true), "C", DEMO_START);
    const port = averagePortPrice(db, "tongkol", "2026-11-05").pricePerKg;
    expect(plan.recommended).toEqual({ kind: "processing", kg: 12, pricePerKg: processingPricePerKg(port) });
    expect(plan.alternatives).toEqual([]);
  });

  it("only records rejected fish as not for consumption", () => {
    const plan = destinationPlan(db, tongkol(5, true), "REJECT", DEMO_START);
    expect(plan.recommended).toEqual({ kind: "not_for_consumption", kg: 5 });
    expect(estimatedPayout(plan.recommended)).toBe(0);
  });

  it("shows the fair tongkol A range from the 7-day port average", () => {
    const fair = fairPriceFor(db, "tongkol", "A", DEMO_START);
    expect(fair.range).toEqual(fairFisherPriceRange(fair.portPricePerKg, "A"));
    expect(fair.toDate).toBe("2026-11-05");
    expect(fair.simulated).toBe(true);
  });
});

describe("ordering", () => {
  it("takes orders for tomorrow until 20.00 and for the day after once the cutoff passes", () => {
    expect(nextDeliveryDate(DEMO_START)).toBe("2026-11-06");
    expect(nextDeliveryDate(new Date("2026-11-05T20:30:00+07:00"))).toBe("2026-11-07");
  });

  it("guides the SPPG kitchen to a tongkol A price that pays fishers above the port price", () => {
    const guide = buyerPriceGuide(db, {
      buyerId: "pembeli-sppg-kampung-melayu",
      buyerKind: "sppg",
      speciesId: "tongkol",
      grade: "A",
      now: DEMO_START,
    });
    expect(guide.lastPricePaid).toBe(20000);
    expect(guide.range.low).toBeLessThanOrEqual(guide.range.high);
    expect(guide.breakEvenPricePerKg).toBeLessThan(guide.range.low);
  });
});
