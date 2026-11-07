import { describe, expect, it } from "vitest";
import { DEMO_DATE, demoTime } from "../demo-clock";
import { DEMO_FISHER_ID } from "../demo-identities";
import { createSeedDatabase } from "../seed";
import {
  decisionHistory,
  fisherLandingDetail,
  fisherLandings,
  groupLandingsByDay,
  lenderBooks,
  monthSummary,
  payoutExplanation,
  payoutsByMonth,
} from "./fisher-pages";
import { debtSummary, payoutsFor } from "./fishers";

const db = createSeedDatabase();
const now = new Date(demoTime(DEMO_DATE, "09:00"));

describe("fisher pages", () => {
  it("lists only the fisher's own landings, newest first, grouped by day", () => {
    const rows = fisherLandings(db, DEMO_FISHER_ID);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((row) => row.view.landing.fisherId === DEMO_FISHER_ID)).toBe(true);
    const groups = groupLandingsByDay(rows);
    expect(groups.map((group) => group.date)).toEqual([...new Set(rows.map((row) => row.date))]);
    expect(groups.reduce((sum, group) => sum + group.rows.length, 0)).toBe(rows.length);
  });

  it("gives every landing a status label", () => {
    for (const row of fisherLandings(db, DEMO_FISHER_ID)) {
      expect(row.status.label.length).toBeGreaterThan(0);
    }
  });

  it("summarises the month with the same debt as the ledger", () => {
    const summary = monthSummary(db, DEMO_FISHER_ID, now);
    expect(summary.outstandingDebt).toBe(debtSummary(db, DEMO_FISHER_ID).outstanding);
    expect(summary.month).toBe(DEMO_DATE.slice(0, 7));
  });

  it("totals payouts by month", () => {
    const months = payoutsByMonth(db, DEMO_FISHER_ID);
    const net = months.reduce((sum, month) => sum + month.net, 0);
    expect(net).toBe(payoutsFor(db, DEMO_FISHER_ID).reduce((sum, payout) => sum + payout.net, 0));
  });

  it("explains a payout as gross minus approved installments", () => {
    const payout = payoutsFor(db, DEMO_FISHER_ID)[0];
    const explanation = payoutExplanation(db, DEMO_FISHER_ID, payout.batchId, now);
    expect(explanation).not.toBeNull();
    expect(explanation!.payout.gross - explanation!.payout.deduction).toBe(explanation!.payout.net);
    expect(explanation!.portPricePerKg).toBeGreaterThan(0);
  });

  it("returns null for unknown ids", () => {
    expect(payoutExplanation(db, DEMO_FISHER_ID, "nope", now)).toBeNull();
    expect(fisherLandingDetail(db, DEMO_FISHER_ID, "nope", now)).toBeNull();
    const other = db.landings.find((landing) => landing.fisherId !== DEMO_FISHER_ID)!;
    expect(fisherLandingDetail(db, DEMO_FISHER_ID, other.id, now)).toBeNull();
  });

  it("runs the book balance and never goes below zero", () => {
    for (const book of lenderBooks(db, DEMO_FISHER_ID)) {
      expect(book.lines.length).toBeGreaterThan(0);
      expect(book.lines.every((line) => line.balance >= 0)).toBe(true);
    }
  });

  it("lists installment decisions", () => {
    const history = decisionHistory(db, DEMO_FISHER_ID);
    expect(history.every((record) => record.entry.kind === "installment")).toBe(true);
  });
});
