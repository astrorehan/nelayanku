import type { Grade } from "@/domain/grade";
import { isSellableGrade } from "@/domain/grade";
import { fairFisherPriceRange, gainOverPortPrice, type PriceBreakdown, type PriceRange } from "@/domain/pricing";
import { isApprovedDeduction } from "@/domain/revenue-share";
import { localDateOf } from "../demo-clock";
import type { DemoDatabase, LedgerEntry } from "../types";
import { batchView, type BatchView } from "./batches";
import { debtSummary, ledgerFor, payoutsFor, type Payout } from "./fishers";
import { landingView, type LandingView } from "./landings";
import { latestReferencePrice } from "./prices";

export type LandingStatusKind = "waiting" | "in_batch" | "paid" | "processing" | "port" | "not_edible";

export interface LandingStatus {
  kind: LandingStatusKind;
  label: string;
  batchCode: string | null;
}

export interface FisherLandingRow {
  view: LandingView;
  date: string;
  status: LandingStatus;
}

/** Where a landing is in its journey, in the words a fisher would use. */
export function landingStatus(db: DemoDatabase, landingId: string, fisherId: string): LandingStatus {
  const landing = db.landings.find((candidate) => candidate.id === landingId);
  if (!landing) {
    return { kind: "waiting", label: "Menunggu", batchCode: null };
  }
  const item = db.batchItems.find((candidate) => candidate.landingId === landingId);
  const batch = item ? db.batches.find((candidate) => candidate.id === item.batchId) : undefined;
  if (batch) {
    const paid = db.ledger.some(
      (entry) => entry.fisherId === fisherId && entry.kind === "income" && entry.batchId === batch.id,
    );
    return paid
      ? { kind: "paid", label: "Dibayar", batchCode: batch.code }
      : { kind: "in_batch", label: `Masuk kiriman ${batch.code}`, batchCode: batch.code };
  }
  switch (landing.destination) {
    case "processing":
      return { kind: "processing", label: "Diolah UMKM", batchCode: null };
    case "port_auction":
      return { kind: "port", label: "Dijual TPI", batchCode: null };
    case "not_for_consumption":
      return { kind: "not_edible", label: "Tidak untuk dimakan", batchCode: null };
    case "batch":
      return { kind: "in_batch", label: "Menunggu kiriman", batchCode: null };
    default:
      return { kind: "waiting", label: "Menunggu dinilai", batchCode: null };
  }
}

export function fisherLandings(db: DemoDatabase, fisherId: string): FisherLandingRow[] {
  return db.landings
    .filter((landing) => landing.fisherId === fisherId)
    .sort((a, b) => b.landedAt.localeCompare(a.landedAt))
    .map((landing) => ({
      view: landingView(db, landing.id)!,
      date: localDateOf(landing.landedAt),
      status: landingStatus(db, landing.id, fisherId),
    }));
}

export interface LandingDayGroup {
  date: string;
  rows: FisherLandingRow[];
  totalKg: number;
}

export function groupLandingsByDay(rows: readonly FisherLandingRow[]): LandingDayGroup[] {
  const groups: LandingDayGroup[] = [];
  for (const row of rows) {
    const last = groups[groups.length - 1];
    if (last && last.date === row.date) {
      last.rows.push(row);
      last.totalKg += row.view.landing.weightKg;
    } else {
      groups.push({ date: row.date, rows: [row], totalKg: row.view.landing.weightKg });
    }
  }
  return groups;
}

export interface MonthSummary {
  month: string;
  soldKg: number;
  topGrade: Grade | null;
  receivedRupiah: number;
  outstandingDebt: number;
}

/** Four numbers for the home strip: kg sold, most common grade, money received, loan left. */
export function monthSummary(db: DemoDatabase, fisherId: string, now: Date): MonthSummary {
  const month = localDateOf(now).slice(0, 7);
  const payouts = payoutsFor(db, fisherId).filter((payout) => localDateOf(payout.date).startsWith(month));
  const monthLandings = fisherLandings(db, fisherId).filter((row) => row.date.startsWith(month));
  const auctionKg = monthLandings
    .filter((row) => row.status.kind === "port")
    .reduce((sum, row) => sum + row.view.landing.weightKg, 0);
  const kgByGrade = new Map<Grade, number>();
  for (const row of monthLandings) {
    if (row.view.grading) {
      kgByGrade.set(row.view.grading.grade, (kgByGrade.get(row.view.grading.grade) ?? 0) + row.view.landing.weightKg);
    }
  }
  const topGrade = [...kgByGrade].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  return {
    month,
    soldKg: payouts.reduce((sum, payout) => sum + payout.kg, 0) + auctionKg,
    topGrade,
    receivedRupiah: payouts.reduce((sum, payout) => sum + payout.net, 0),
    outstandingDebt: debtSummary(db, fisherId).outstanding,
  };
}

export interface PayoutMonth {
  month: string;
  payouts: Payout[];
  kg: number;
  gross: number;
  deduction: number;
  net: number;
}

export function payoutsByMonth(db: DemoDatabase, fisherId: string): PayoutMonth[] {
  const months: PayoutMonth[] = [];
  for (const payout of payoutsFor(db, fisherId)) {
    const month = localDateOf(payout.date).slice(0, 7);
    let group = months.find((candidate) => candidate.month === month);
    if (!group) {
      group = { month, payouts: [], kg: 0, gross: 0, deduction: 0, net: 0 };
      months.push(group);
    }
    group.payouts.push(payout);
    group.kg += payout.kg;
    group.gross += payout.gross;
    group.deduction += payout.deduction;
    group.net += payout.net;
  }
  return months;
}

export interface PayoutExplanation {
  payout: Payout;
  view: BatchView;
  pricePerKg: number;
  portPricePerKg: number;
  portDate: string;
  gainRate: number;
  extraVersusPort: number;
  fairRange: PriceRange | null;
  breakdown: PriceBreakdown;
  deductions: LedgerEntry[];
}

/** Everything the "kenapa harganya segini" page needs, or null for an unknown or foreign batch. */
export function payoutExplanation(
  db: DemoDatabase,
  fisherId: string,
  batchId: string,
  now: Date,
): PayoutExplanation | null {
  const payout = payoutsFor(db, fisherId).find((candidate) => candidate.batchId === batchId);
  const view = payout ? batchView(db, batchId, now) : undefined;
  if (!payout || !view) {
    return null;
  }
  const pricePerKg = payout.kg > 0 ? Math.round(payout.gross / payout.kg) : 0;
  const port = latestReferencePrice(db, view.species.id, "port", localDateOf(payout.date));
  const grade = view.batchGrade;
  return {
    payout,
    view,
    pricePerKg,
    portPricePerKg: port.pricePerKg,
    portDate: port.date,
    gainRate: gainOverPortPrice(pricePerKg, port.pricePerKg),
    extraVersusPort: Math.round((pricePerKg - port.pricePerKg) * payout.kg),
    fairRange: grade && isSellableGrade(grade) ? fairFisherPriceRange(port.pricePerKg, grade) : null,
    breakdown: view.breakdown,
    deductions: ledgerFor(db, fisherId).filter(
      (entry) => entry.batchId === batchId && entry.kind === "installment" && entry.approval !== null,
    ),
  };
}

export interface BookLine {
  entry: LedgerEntry;
  /** Counts towards the balance only when approved and the buyer has paid. */
  counted: boolean;
  balance: number;
}

export interface LenderBook {
  lender: string;
  principal: number;
  repaid: number;
  outstanding: number;
  lines: BookLine[];
  averageInstallment: number | null;
  installmentsLeft: number | null;
}

/** Cash book per lender, oldest first, with a running balance. */
export function lenderBooks(db: DemoDatabase, fisherId: string): LenderBook[] {
  const entries = [...ledgerFor(db, fisherId)].reverse();
  const summary = debtSummary(db, fisherId);
  const scheduledIds = new Set(summary.scheduled.map((entry) => entry.id));
  return summary.lenders.map((lender) => {
    const mine = entries.filter((entry) => entry.counterparty === lender.lender && entry.kind !== "income");
    let balance = 0;
    const lines = mine.map((entry): BookLine => {
      const counted =
        entry.kind === "loan" ||
        (entry.approval !== null && isApprovedDeduction(entry.approval) && !scheduledIds.has(entry.id));
      if (counted) {
        balance += entry.kind === "loan" ? entry.amount : -entry.amount;
      }
      return { entry, counted, balance };
    });
    const settled = lines.filter((line) => line.entry.kind === "installment" && line.counted);
    const averageInstallment = settled.length
      ? Math.round(settled.reduce((sum, line) => sum + line.entry.amount, 0) / settled.length)
      : null;
    return {
      ...lender,
      lines,
      averageInstallment,
      installmentsLeft:
        averageInstallment && lender.outstanding > 0 ? Math.ceil(lender.outstanding / averageInstallment) : null,
    };
  });
}

export interface DecisionRecord {
  entry: LedgerEntry;
  decidedAt: string | null;
}

/** Installment requests with the time the fisher answered, taken from the audit log. */
export function decisionHistory(db: DemoDatabase, fisherId: string): DecisionRecord[] {
  return ledgerFor(db, fisherId)
    .filter((entry) => entry.kind === "installment")
    .map((entry) => {
      const decided = db.auditLog
        .filter((log) => log.action === "decide_deduction" && log.entity === entry.id)
        .sort((a, b) => b.at.localeCompare(a.at))[0];
      return { entry, decidedAt: decided?.at ?? null };
    });
}

export interface LandingDetail {
  view: LandingView;
  status: LandingStatus;
  batch: BatchView | null;
  payout: Payout | null;
  processingMaterialId: string | null;
}

export function fisherLandingDetail(
  db: DemoDatabase,
  fisherId: string,
  landingId: string,
  now: Date,
): LandingDetail | null {
  const view = landingView(db, landingId);
  if (!view || view.landing.fisherId !== fisherId) {
    return null;
  }
  const item = db.batchItems.find((candidate) => candidate.landingId === landingId);
  const batch = item ? (batchView(db, item.batchId, now) ?? null) : null;
  return {
    view,
    status: landingStatus(db, landingId, fisherId),
    batch,
    payout: batch ? (payoutsFor(db, fisherId).find((payout) => payout.batchId === batch.batch.id) ?? null) : null,
    processingMaterialId: db.materials.find((material) => material.landingId === landingId)?.id ?? null,
  };
}
