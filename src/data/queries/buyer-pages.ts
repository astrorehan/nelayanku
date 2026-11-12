import { addDays, localDateOf } from "../demo-clock";
import type { BatchStatus } from "../types";
import type { BatchView } from "./batches";

export const ACTIVE_BATCH_STATUSES: readonly BatchStatus[] = ["filling", "full", "labelled", "in_transit"];

export type OrderFilter = "semua" | "berjalan" | "diterima" | "ditolak" | "dibatalkan";

export const ORDER_FILTERS: ReadonlyArray<{ value: OrderFilter; title: string }> = [
  { value: "semua", title: "Semua" },
  { value: "berjalan", title: "Berjalan" },
  { value: "diterima", title: "Diterima" },
  { value: "ditolak", title: "Ditolak" },
  { value: "dibatalkan", title: "Dibatalkan" },
];

export function isActiveView(view: BatchView): boolean {
  return ACTIVE_BATCH_STATUSES.includes(view.batch.status);
}

export function matchesOrderFilter(view: BatchView, filter: OrderFilter): boolean {
  switch (filter) {
    case "semua":
      return true;
    case "berjalan":
      return isActiveView(view);
    case "diterima":
      return view.batch.status === "received";
    case "ditolak":
      return view.batch.status === "rejected";
    case "dibatalkan":
      return view.batch.status === "cancelled";
  }
}

export function filterCounts(views: readonly BatchView[]): Record<OrderFilter, number> {
  return {
    semua: views.length,
    berjalan: views.filter((view) => matchesOrderFilter(view, "berjalan")).length,
    diterima: views.filter((view) => matchesOrderFilter(view, "diterima")).length,
    ditolak: views.filter((view) => matchesOrderFilter(view, "ditolak")).length,
    dibatalkan: views.filter((view) => matchesOrderFilter(view, "dibatalkan")).length,
  };
}

export interface MonthGroup {
  /** yyyy-mm */
  key: string;
  /** First day of the month (yyyy-mm-01), for formatting. */
  firstDay: string;
  views: BatchView[];
}

/** Groups views by delivery month, newest month first and newest order first inside. */
export function groupByMonth(views: readonly BatchView[]): MonthGroup[] {
  const groups = new Map<string, BatchView[]>();
  for (const view of [...views].sort((a, b) => b.order.deliverAt.localeCompare(a.order.deliverAt))) {
    const key = localDateOf(view.order.deliverAt).slice(0, 7);
    groups.set(key, [...(groups.get(key) ?? []), view]);
  }
  return [...groups.entries()].map(([key, items]) => ({ key, firstDay: `${key}-01`, views: items }));
}

/** Kg the buyer actually took (accepted) or, before receipt, the kg in the crate. */
export function orderKg(view: BatchView): number {
  if (view.receipt) {
    return view.receipt.decision === "reject" ? 0 : view.receipt.acceptedKg;
  }
  return view.filledKg;
}

export function orderTotal(view: BatchView): number {
  if (view.batch.status === "rejected" || view.batch.status === "cancelled") return 0;
  if (view.payment) {
    return view.payment.amount;
  }
  return Math.round((view.filledKg || view.targetKg) * view.order.pricePerKg);
}

export interface BuyerSummary {
  monthKey: string;
  kgThisMonth: number;
  spendThisMonth: number;
  /** Weighted by kg over received and rejected batches this month; null when there is none. */
  averageScore: number | null;
  receivedCount: number;
  rejectedCount: number;
}

export function buyerSummary(views: readonly BatchView[], now: Date): BuyerSummary {
  const monthKey = localDateOf(now).slice(0, 7);
  const inMonth = views.filter((view) => localDateOf(view.order.deliverAt).startsWith(monthKey));
  const closed = inMonth.filter((view) => view.batch.status === "received" || view.batch.status === "rejected");
  const received = inMonth.filter((view) => view.batch.status === "received");
  const scored = closed.filter((view) => view.averageScore !== null && view.filledKg > 0);
  const scoredKg = scored.reduce((sum, view) => sum + view.filledKg, 0);
  return {
    monthKey,
    kgThisMonth: Math.round(received.reduce((sum, view) => sum + orderKg(view), 0) * 10) / 10,
    spendThisMonth: received.reduce((sum, view) => sum + orderTotal(view), 0),
    averageScore:
      scoredKg > 0
        ? Math.round((scored.reduce((sum, view) => sum + view.averageScore! * view.filledKg, 0) / scoredKg) * 10) / 10
        : null,
    receivedCount: received.length,
    rejectedCount: closed.length - received.length,
  };
}

export interface DailyKg {
  date: string;
  kg: number;
}

/** Accepted kg per delivery day for the last `days` days ending at `now`'s date, oldest first. */
export function dailyKg(views: readonly BatchView[], now: Date, days = 30): DailyKg[] {
  const today = localDateOf(now);
  const series: DailyKg[] = Array.from({ length: days }, (_, index) => ({
    date: addDays(today, index - (days - 1)),
    kg: 0,
  }));
  for (const view of views) {
    if (view.batch.status !== "received") {
      continue;
    }
    const slot = series.find((entry) => entry.date === localDateOf(view.order.deliverAt));
    if (slot) {
      slot.kg += orderKg(view);
    }
  }
  return series.map((entry) => ({ ...entry, kg: Math.round(entry.kg * 10) / 10 }));
}

export interface OrderMoney {
  total: number;
  down: number;
  remaining: number;
  paid: boolean;
  late: boolean;
  /** True when the total is worked out from the order, not from a payment record. */
  estimated: boolean;
}

export function orderMoney(view: BatchView): OrderMoney {
  const total = orderTotal(view);
  const down = Math.round(total * view.order.downPaymentRate);
  const paid = view.payment?.status === "paid" || view.payment?.status === "late";
  return {
    total,
    down,
    remaining: paid ? 0 : total - down,
    paid,
    late: view.payment?.status === "late",
    estimated: !view.payment && view.batch.status !== "rejected" && view.batch.status !== "cancelled",
  };
}

export interface ActionItem {
  kind: "receive" | "balance";
  view: BatchView;
  title: string;
  detail: string;
  href: string;
  actionLabel: string;
}

/** What the buyer has to do now: receive arrived shipments, then settle the balance. */
export function buyerActions(views: readonly BatchView[]): ActionItem[] {
  const receive: ActionItem[] = [];
  const balance: ActionItem[] = [];
  for (const view of views) {
    if (view.batch.status === "in_transit" && !view.receipt) {
      receive.push({
        kind: "receive",
        view,
        title: `${view.species.name} ${view.batch.code} menuju Anda`,
        detail: "Cek isi peti saat tiba, lalu terima atau tolak.",
        href: `/pembeli/terima/${view.batch.code}`,
        actionLabel: "Terima kiriman",
      });
    }
    if (view.batch.status === "in_transit" || view.batch.status === "labelled") {
      balance.push({
        kind: "balance",
        view,
        title: `Sisa bayar ${view.batch.code}`,
        detail: "Dibayar saat kiriman diterima (simulasi).",
        href: `/pembeli/pesanan/${view.batch.code}`,
        actionLabel: "Lihat tagihan",
      });
    }
  }
  return [...receive, ...balance];
}

export type TimelineState = "done" | "current" | "pending" | "failed";

export interface TimelineStep {
  key: "dipesan" | "diisi" | "label" | "berangkat" | "hasil";
  title: string;
  state: TimelineState;
  at: string | null;
  note: string | null;
}

export function orderTimeline(view: BatchView): TimelineStep[] {
  const status = view.batch.status;
  const cancelled = status === "cancelled";
  const closed = status === "received" || status === "rejected";
  const lastLanding = view.contributions.reduce<string | null>(
    (latest, item) => (latest === null || item.landing.landedAt > latest ? item.landing.landedAt : latest),
    null,
  );
  const filled = view.isFull || status === "labelled" || status === "in_transit" || closed;
  const labelled = view.batch.labelledAt !== null || status === "in_transit" || closed;
  const departed = view.batch.departedAt !== null || closed;

  const stateFor = (done: boolean, previousDone: boolean): TimelineState =>
    done ? "done" : previousDone && !cancelled ? "current" : "pending";

  const resultTitle =
    status === "rejected" ? "Ditolak saat diterima" : view.receipt?.decision === "accept_partial" ? "Diterima sebagian" : "Diterima";

  return [
    { key: "dipesan", title: "Dipesan", state: "done", at: view.order.placedAt, note: null },
    {
      key: "diisi",
      title: "Diisi dari tangkapan",
      state: stateFor(filled, true),
      at: filled ? lastLanding : null,
      note: `${view.contributions.length} pendaratan, ${Math.round(view.filledKg * 10) / 10} dari ${view.targetKg} kg`,
    },
    { key: "label", title: "Label QR dipasang", state: stateFor(labelled, filled), at: view.batch.labelledAt, note: null },
    {
      key: "berangkat",
      title: "Berangkat",
      state: stateFor(departed, labelled),
      at: view.batch.departedAt,
      note: view.batch.checklist ? `Kurir ${view.batch.checklist.courier}` : null,
    },
    {
      key: "hasil",
      title: closed ? resultTitle : cancelled ? "Dibatalkan KUB" : "Diterima",
      state: status === "rejected" ? "failed" : stateFor(closed, departed),
      at: view.receipt?.receivedAt ?? null,
      note: view.receipt?.reason ?? null,
    },
  ];
}

export type BuyerDocumentKind = "faktur" | "mutu" | "berita-acara";

export interface BuyerDocumentEntry {
  kind: BuyerDocumentKind;
  title: string;
  available: boolean;
  unavailableReason: string;
}

export function documentsFor(view: BatchView): BuyerDocumentEntry[] {
  const receipt = view.receipt;
  return [
    {
      kind: "faktur",
      title: "Faktur",
      available: !!receipt && receipt.decision !== "reject",
      unavailableReason: "Tersedia setelah ada ikan yang diterima",
    },
    {
      kind: "mutu",
      title: "Dokumen mutu",
      available: view.contributions.length > 0,
      unavailableReason: "Tersedia setelah ada ikan masuk peti",
    },
    {
      kind: "berita-acara",
      title: receipt?.decision === "reject" ? "Bukti penolakan" : "Berita acara terima",
      available: !!receipt,
      unavailableReason: "Tersedia setelah kiriman diterima atau ditolak",
    },
  ];
}
