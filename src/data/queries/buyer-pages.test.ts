import { describe, expect, it } from "vitest";
import { DEMO_START } from "../demo-clock";
import { DEMO_BUYER_ID } from "../demo-identities";
import { createSeedDatabase } from "../seed";
import { batchesForBuyer } from "./batches";
import {
  buyerActions,
  buyerSummary,
  dailyKg,
  documentsFor,
  filterCounts,
  groupByMonth,
  matchesOrderFilter,
  orderMoney,
  orderTimeline,
} from "./buyer-pages";

const db = createSeedDatabase();
const views = batchesForBuyer(db, DEMO_BUYER_ID, DEMO_START);

describe("buyer pages queries", () => {
  it("has seed views to test with", () => {
    expect(views.length).toBeGreaterThan(5);
  });

  it("counts filters consistently", () => {
    const counts = filterCounts(views);
    expect(counts.semua).toBe(views.length);
    expect(counts.berjalan + counts.diterima + counts.ditolak + counts.dibatalkan).toBe(views.length);
    expect(views.filter((view) => matchesOrderFilter(view, "diterima"))).toHaveLength(counts.diterima);
  });

  it("groups by month, newest first, without losing orders", () => {
    const groups = groupByMonth(views);
    expect(groups.reduce((sum, group) => sum + group.views.length, 0)).toBe(views.length);
    const keys = groups.map((group) => group.key);
    expect([...keys].sort().reverse()).toEqual(keys);
  });

  it("summarises the current month", () => {
    const summary = buyerSummary(views, DEMO_START);
    expect(summary.monthKey).toBe("2026-11");
    expect(summary.kgThisMonth).toBeGreaterThanOrEqual(0);
    if (summary.averageScore !== null) {
      expect(summary.averageScore).toBeGreaterThan(0);
      expect(summary.averageScore).toBeLessThanOrEqual(10);
    }
  });

  it("builds a 30 day series ending today", () => {
    const series = dailyKg(views, DEMO_START, 30);
    expect(series).toHaveLength(30);
    expect(series[29].date).toBe("2026-11-05");
    expect(series[0].date < series[29].date).toBe(true);
  });

  it("splits money into down payment and remaining", () => {
    for (const view of views) {
      const money = orderMoney(view);
      expect(money.down).toBeLessThanOrEqual(money.total);
      if (money.paid) {
        expect(money.remaining).toBe(0);
      } else {
        expect(money.down + money.remaining).toBe(money.total);
      }
    }
  });

  it("builds a five step timeline with a failed end for rejected orders", () => {
    for (const view of views) {
      const steps = orderTimeline(view);
      expect(steps).toHaveLength(5);
      expect(steps[0].state).toBe("done");
      if (view.batch.status === "rejected") {
        expect(steps[4].state).toBe("failed");
      }
      if (view.batch.status === "received") {
        expect(steps.every((step) => step.state === "done")).toBe(true);
      }
    }
  });

  it("only asks to receive shipments that are in transit", () => {
    for (const action of buyerActions(views).filter((item) => item.kind === "receive")) {
      expect(action.view.batch.status).toBe("in_transit");
      expect(action.href).toBe(`/pembeli/terima/${action.view.batch.code}`);
    }
  });

  it("gates documents on receipt", () => {
    for (const view of views) {
      const docs = documentsFor(view);
      expect(docs).toHaveLength(3);
      const faktur = docs.find((doc) => doc.kind === "faktur")!;
      expect(faktur.available).toBe(!!view.receipt && view.receipt.decision !== "reject");
    }
  });
});
