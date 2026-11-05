import { priceBreakdown } from "@/domain/pricing";
import { splitRevenue, type RevenueShare } from "@/domain/revenue-share";
import type { DemoDatabase, Fisher, LedgerEntry } from "../types";
import { batchView, type BatchView } from "./batches";

export interface LenderBalance {
  lender: string;
  principal: number;
  repaid: number;
  outstanding: number;
}

export interface DebtSummary {
  lenders: LenderBalance[];
  principal: number;
  repaid: number;
  outstanding: number;
  pending: LedgerEntry[];
  scheduled: LedgerEntry[];
}

const isSettledInstallment = (entry: LedgerEntry) =>
  entry.kind === "installment" && (entry.approval === "approved_by_link" || entry.approval === "approved_verbally");

const buyerHasPaid = (db: DemoDatabase, batchId: string | null) =>
  batchId === null || db.payments.some((payment) => payment.batchId === batchId && payment.paidAt !== null);

export function ledgerFor(db: DemoDatabase, fisherId: string): LedgerEntry[] {
  return db.ledger.filter((entry) => entry.fisherId === fisherId).sort((a, b) => b.date.localeCompare(a.date));
}

export function debtSummary(db: DemoDatabase, fisherId: string): DebtSummary {
  const entries = ledgerFor(db, fisherId);
  const lenderNames = [...new Set(entries.filter((entry) => entry.kind === "loan").map((entry) => entry.counterparty))];
  const lenders = lenderNames.map((lender): LenderBalance => {
    const principal = entries
      .filter((entry) => entry.kind === "loan" && entry.counterparty === lender)
      .reduce((sum, entry) => sum + entry.amount, 0);
    const repaid = entries
      .filter((entry) => isSettledInstallment(entry) && entry.counterparty === lender && buyerHasPaid(db, entry.batchId))
      .reduce((sum, entry) => sum + entry.amount, 0);
    return { lender, principal, repaid, outstanding: principal - repaid };
  });
  return {
    lenders,
    principal: lenders.reduce((sum, lender) => sum + lender.principal, 0),
    repaid: lenders.reduce((sum, lender) => sum + lender.repaid, 0),
    outstanding: lenders.reduce((sum, lender) => sum + lender.outstanding, 0),
    pending: entries.filter((entry) => entry.kind === "installment" && entry.approval === "pending"),
    scheduled: entries.filter((entry) => isSettledInstallment(entry) && !buyerHasPaid(db, entry.batchId)),
  };
}

export interface Payout {
  batchId: string;
  date: string;
  kg: number;
  gross: number;
  deduction: number;
  net: number;
}

export function payoutsFor(db: DemoDatabase, fisherId: string): Payout[] {
  const entries = ledgerFor(db, fisherId);
  return entries
    .filter((entry) => entry.kind === "income" && entry.batchId)
    .map((income): Payout => {
      const deduction = entries
        .filter((entry) => entry.batchId === income.batchId && isSettledInstallment(entry))
        .reduce((sum, entry) => sum + entry.amount, 0);
      const kg = db.batchItems
        .filter((item) => item.batchId === income.batchId)
        .filter((item) => db.landings.find((landing) => landing.id === item.landingId)?.fisherId === fisherId)
        .reduce((sum, item) => sum + item.kg, 0);
      return { batchId: income.batchId!, date: income.date, kg, gross: income.amount, deduction, net: income.amount - deduction };
    });
}

export function revenueShareForBatch(db: DemoDatabase, batchId: string): RevenueShare {
  const batch = db.batches.find((candidate) => candidate.id === batchId)!;
  const order = db.orders.find((candidate) => candidate.id === batch.orderId)!;
  const buyer = db.buyers.find((candidate) => candidate.id === order.buyerId)!;
  const receipt = db.receipts.find((candidate) => candidate.batchId === batchId);
  const items = db.batchItems.filter((item) => item.batchId === batchId);
  const filledKg = items.reduce((sum, item) => sum + item.kg, 0);
  const acceptedRatio = receipt && filledKg > 0 ? receipt.acceptedKg / filledKg : 1;
  return splitRevenue({
    contributions: items.map((item) => ({
      fisherId: db.landings.find((landing) => landing.id === item.landingId)!.fisherId,
      kg: Math.round(item.kg * acceptedRatio * 10) / 10,
    })),
    fisherPricePerKg: priceBreakdown(order.pricePerKg, buyer.kind).fisherReceivesPerKg,
    deductions: db.ledger
      .filter((entry) => entry.batchId === batchId && entry.kind === "installment" && entry.approval)
      .map((entry) => ({ fisherId: entry.fisherId, amount: entry.amount, status: entry.approval! })),
  });
}

export interface BatchPayout {
  view: BatchView;
  share: RevenueShare;
}

export function batchPayouts(db: DemoDatabase, now: Date): BatchPayout[] {
  return db.batches
    .filter((batch) => batch.status === "received")
    .map((batch) => batchView(db, batch.id, now)!)
    .sort((a, b) => (b.receipt?.receivedAt ?? "").localeCompare(a.receipt?.receivedAt ?? ""))
    .map((view) => ({ view, share: revenueShareForBatch(db, view.batch.id) }));
}

export interface FisherDebt {
  fisher: Fisher;
  summary: DebtSummary;
}

export function fishersWithDebt(db: DemoDatabase): FisherDebt[] {
  return db.fishers
    .map((fisher) => ({ fisher, summary: debtSummary(db, fisher.id) }))
    .filter(({ summary }) => summary.principal > 0)
    .sort((a, b) => b.summary.outstanding - a.summary.outstanding);
}

export function installmentAwaitingPayment(db: DemoDatabase, fisherId: string): LedgerEntry | null {
  return (
    ledgerFor(db, fisherId).find(
      (entry) => entry.kind === "installment" && entry.batchId !== null && !buyerHasPaid(db, entry.batchId),
    ) ?? null
  );
}
