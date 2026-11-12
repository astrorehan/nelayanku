import { freshDeadline, minutesSince, remainingFreshMinutes, freshClockStatus, type FreshClockStatus } from "@/domain/cold-chain";
import type { Grade } from "@/domain/grade";
import { addDays, localDateOf } from "../demo-clock";
import type { AuditEntry, DemoDatabase, Fisher, LedgerEntry, ProcessingMaterial } from "../types";
import { batchView, type BatchView } from "./batches";
import { debtSummary, ledgerFor, payoutsFor, type DebtSummary, type Payout } from "./fishers";
import { landingView, type LandingView } from "./landings";

export const MEMBER_WINDOW_DAYS = 30;
export const NEAR_CUTOFF_MINUTES = 180;

export type OrderFilter = "aktif" | "jalan" | "selesai" | "ditolak";

export const ORDER_FILTERS: ReadonlyArray<{ value: OrderFilter; title: string }> = [
  { value: "aktif", title: "Aktif" },
  { value: "jalan", title: "Di jalan" },
  { value: "selesai", title: "Selesai" },
  { value: "ditolak", title: "Ditolak" },
];

export function orderFilterOf(view: BatchView): OrderFilter {
  switch (view.batch.status) {
    case "filling":
    case "full":
    case "labelled":
      return "aktif";
    case "in_transit":
      return "jalan";
    case "rejected":
      return "ditolak";
    case "received":
      return view.receipt?.decision === "reject" ? "ditolak" : "selesai";
    case "cancelled":
      return "selesai";
  }
}

export function allBatchViews(db: DemoDatabase, now: Date): BatchView[] {
  return db.batches.map((batch) => batchView(db, batch.id, now)!);
}

export function countByFilter(views: readonly BatchView[]): Record<OrderFilter, number> {
  const counts: Record<OrderFilter, number> = { aktif: 0, jalan: 0, selesai: 0, ditolak: 0 };
  for (const view of views) {
    counts[orderFilterOf(view)] += 1;
  }
  return counts;
}

export interface OrderDay {
  date: string;
  views: BatchView[];
}

/** Groups by delivery day, newest day first; inside a day the earliest delivery comes first. */
export function groupOrdersByDay(views: readonly BatchView[]): OrderDay[] {
  const days = new Map<string, BatchView[]>();
  for (const view of views) {
    const date = localDateOf(view.order.deliverAt);
    days.set(date, [...(days.get(date) ?? []), view]);
  }
  return [...days.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, list]) => ({
      date,
      views: [...list].sort((a, b) => a.order.deliverAt.localeCompare(b.order.deliverAt)),
    }));
}

export type AttentionKind = "rejected" | "partial" | "late_payment" | "not_full";

export interface AttentionItem {
  kind: AttentionKind;
  batchId: string;
  title: string;
  detail: string;
}

/** Things the operator should handle: rejections, partial receipts, late payments, batches not full near cutoff. */
export function attentionItems(db: DemoDatabase, now: Date): AttentionItem[] {
  const items: AttentionItem[] = [];
  for (const view of allBatchViews(db, now)) {
    const label = `${view.species.name} untuk ${view.buyer.name}`;
    if (orderFilterOf(view) === "ditolak") {
      items.push({
        kind: "rejected",
        batchId: view.batch.id,
        title: `${label} ditolak`,
        detail: view.receipt?.reason ?? "Periksa catatan penolakan dan putuskan langkah berikutnya.",
      });
    } else if (view.receipt?.decision === "accept_partial") {
      items.push({
        kind: "partial",
        batchId: view.batch.id,
        title: `${label} diterima sebagian`,
        detail: view.receipt.reason ?? `${view.receipt.acceptedKg} kg diterima.`,
      });
    }
    const payment = view.payment;
    if (payment && (payment.status === "late" || (payment.paidAt === null && new Date(payment.dueAt) < now))) {
      items.push({
        kind: "late_payment",
        batchId: view.batch.id,
        title: `Pembayaran ${label} terlambat`,
        detail: payment.paidAt ? "Sudah dibayar, tetapi melewati jatuh tempo." : "Belum dibayar dan sudah lewat jatuh tempo.",
      });
    }
    if (view.batch.status === "filling" && !view.isFull) {
      const minutesLeft = Math.floor((new Date(view.batch.fillDeadline).getTime() - now.getTime()) / 60_000);
      if (minutesLeft <= NEAR_CUTOFF_MINUTES) {
        items.push({
          kind: "not_full",
          batchId: view.batch.id,
          title: `${label} belum penuh`,
          detail: `Kurang ${view.remainingKg} kg${minutesLeft <= 0 ? ", batas isi sudah lewat" : ", batas isi sebentar lagi"}.`,
        });
      }
    }
  }
  return items;
}

export interface MemberSummary {
  fisher: Fisher;
  kg: number;
  income: number;
  landingCount: number;
  outstandingDebt: number;
}

function sinceDate(now: Date, days = MEMBER_WINDOW_DAYS) {
  return addDays(localDateOf(now), -days);
}

function incomeSince(entries: readonly LedgerEntry[], from: string) {
  return entries
    .filter((entry) => entry.kind === "income" && localDateOf(entry.date) >= from)
    .reduce((sum, entry) => sum + entry.amount, 0);
}

export function memberSummaries(db: DemoDatabase, now: Date): MemberSummary[] {
  const from = sinceDate(now);
  return db.fishers
    .map((fisher): MemberSummary => {
      const landings = db.landings.filter((landing) => landing.fisherId === fisher.id && localDateOf(landing.landedAt) >= from);
      return {
        fisher,
        kg: landings.reduce((sum, landing) => sum + landing.weightKg, 0),
        income: incomeSince(ledgerFor(db, fisher.id), from),
        landingCount: landings.length,
        outstandingDebt: debtSummary(db, fisher.id).outstanding,
      };
    })
    .sort((a, b) => a.fisher.memberNumber - b.fisher.memberNumber);
}

export function matchesMemberSearch(summary: MemberSummary, speciesName: string, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return true;
  }
  return [summary.fisher.name, String(summary.fisher.memberNumber), speciesName].some((text) => text.toLowerCase().includes(needle));
}

export interface GradeShare {
  grade: Grade;
  kg: number;
  count: number;
}

export interface MemberProfile {
  summary: MemberSummary;
  landings: LandingView[];
  gradeShares: GradeShare[];
  payouts: Payout[];
  ledger: LedgerEntry[];
  debt: DebtSummary;
}

export function memberProfile(db: DemoDatabase, fisherId: string, now: Date): MemberProfile | undefined {
  const summary = memberSummaries(db, now).find((entry) => entry.fisher.id === fisherId);
  if (!summary) {
    return undefined;
  }
  const landings = db.landings
    .filter((landing) => landing.fisherId === fisherId)
    .sort((a, b) => b.landedAt.localeCompare(a.landedAt))
    .map((landing) => landingView(db, landing.id)!);
  const grades: Grade[] = ["A", "B", "C", "REJECT"];
  const gradeShares = grades
    .map((grade): GradeShare => {
      const matching = landings.filter((view) => view.grading?.grade === grade);
      return { grade, kg: matching.reduce((sum, view) => sum + view.landing.weightKg, 0), count: matching.length };
    })
    .filter((share) => share.count > 0);
  return {
    summary,
    landings,
    gradeShares,
    payouts: payoutsFor(db, fisherId),
    ledger: ledgerFor(db, fisherId),
    debt: debtSummary(db, fisherId),
  };
}

export interface LandingDetail {
  view: LandingView;
  batch: BatchView | null;
  material: ProcessingMaterial | null;
  elapsedMinutes: number;
  windowHours: number;
  remainingMinutes: number;
  freshStatus: FreshClockStatus;
  deadline: Date;
  audit: AuditEntry[];
}

export function landingDetail(db: DemoDatabase, landingId: string, now: Date): LandingDetail | undefined {
  const view = landingView(db, landingId);
  if (!view) {
    return undefined;
  }
  const { landing, species } = view;
  const landedAt = new Date(landing.landedAt);
  const batchItem = db.batchItems.find((item) => item.landingId === landing.id);
  const gradingId = view.grading?.id;
  return {
    view,
    batch: batchItem ? (batchView(db, batchItem.batchId, now) ?? null) : null,
    material: db.materials.find((material) => material.landingId === landing.id) ?? null,
    elapsedMinutes: minutesSince(landedAt, now),
    windowHours: landing.iced ? species.freshnessWindow.icedHours : species.freshnessWindow.unicedHours,
    remainingMinutes: remainingFreshMinutes(landedAt, now, species.freshnessWindow, landing.iced),
    freshStatus: freshClockStatus(landedAt, now, species.freshnessWindow, landing.iced),
    deadline: freshDeadline(landedAt, species.freshnessWindow, landing.iced),
    audit: db.auditLog.filter((entry) => entry.entity === landing.id || (gradingId !== undefined && entry.entity === gradingId)),
  };
}
