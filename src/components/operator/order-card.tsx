"use client";

import Link from "next/link";
import { Icon } from "@/components/icons/icon";
import { GradeStamp } from "@/components/ui/grade-stamp";
import type { PillTone } from "@/components/ui/surface";
import type { BatchView } from "@/data/queries/batches";
import type { BatchStatus } from "@/data/types";
import { formatClock, formatDecimal, formatKg } from "@/lib/format";

export function batchStatusLine(view: BatchView): string {
  switch (view.batch.status) {
    case "filling":
      return `Kirim ${formatClock(view.order.deliverAt)}`;
    case "full":
      return `Penuh · kirim ${formatClock(view.order.deliverAt)}`;
    case "labelled":
      return `Label siap · kirim ${formatClock(view.order.deliverAt)}`;
    case "in_transit":
      return `Berangkat ${formatClock(view.batch.departedAt!)} · dalam perjalanan`;
    case "received":
      return `Diterima ${view.receipt ? formatClock(view.receipt.receivedAt) : ""}`;
    case "rejected":
      return "Ditolak pembeli";
    case "cancelled":
      return "Dibatalkan, dijual ke TPI";
  }
}

export const BATCH_STATUS_PILL: Record<
  BatchStatus,
  { label: string; tone: PillTone }
> = {
  filling: { label: "Diisi", tone: "neutral" },
  full: { label: "Penuh", tone: "ink" },
  labelled: { label: "Label siap", tone: "ink" },
  in_transit: { label: "Di jalan", tone: "info" },
  received: { label: "Diterima", tone: "success" },
  rejected: { label: "Ditolak", tone: "danger" },
  cancelled: { label: "Dibatalkan", tone: "neutral" },
};

export function OrderCard({ view }: { view: BatchView }) {
  const moving = view.batch.status === "in_transit";
  const accepting = ["filling", "full", "labelled"].includes(view.batch.status);
  const actionLabel: Record<BatchStatus, string> = {
    filling: "Isi pesanan",
    full: "Siapkan kiriman",
    labelled: "Checklist kirim",
    in_transit: "Lihat kiriman",
    received: "Lihat catatan",
    rejected: "Periksa penolakan",
    cancelled: "Lihat catatan",
  };
  const share = Math.min(1, view.filledKg / view.targetKg);
  return (
    <Link
      href={`/kub/batch/${view.batch.id}`}
      className="shipment-record group"
    >
      <div className="mb-3 flex items-center justify-between gap-3 text-sm text-ink-2">
        <span className="type-code text-sm">{view.batch.code}</span>
        <span className="flex items-center gap-2">
          {moving ? (
            <>
              <Icon name="courier" size={16} />
              Di jalan
            </>
          ) : accepting ? (
            <>
              Kirim{" "}
              <span className="type-code text-ink">
                {formatClock(view.order.deliverAt)}
              </span>
            </>
          ) : (
            BATCH_STATUS_PILL[view.batch.status].label
          )}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <GradeStamp grade={view.order.minimumGrade} size="sm" />
          <h3 className="font-[family-name:var(--font-display)] text-[1.625rem] font-medium leading-tight">
            {view.species.name}
          </h3>
        </div>
        <p className="tabular whitespace-nowrap text-[1.625rem] font-medium leading-none">
          {formatDecimal(view.filledKg)}
          <span className="ml-1 text-base font-normal text-ink-2">
            / {formatKg(view.targetKg)}
          </span>
        </p>
      </div>
      <p className="mt-3 text-ink-2">{view.buyer.name}</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className={moving ? "text-ink-2" : "font-medium text-ink"}>
          {moving
            ? `Berangkat ${formatClock(view.batch.departedAt!)}`
            : !accepting
              ? batchStatusLine(view)
              : view.isFull
                ? BATCH_STATUS_PILL[view.batch.status].label
                : `Kurang ${formatKg(view.remainingKg)}`}
        </span>
        <span className="flex items-center gap-2 text-sm text-ink-2">
          {actionLabel[view.batch.status]}
          <Icon name="arrowRight" size={18} />
        </span>
      </div>
      {accepting && (
        <div
          className="shipment-fill"
          role="meter"
          aria-label={`${view.species.name}: ${view.filledKg} dari ${view.targetKg} kg terisi`}
          aria-valuenow={view.filledKg}
          aria-valuemin={0}
          aria-valuemax={view.targetKg}
        >
          <span style={{ width: `${share * 100}%` }} />
        </div>
      )}
    </Link>
  );
}
