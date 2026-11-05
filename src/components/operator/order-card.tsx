"use client";

import clsx from "clsx";
import Link from "next/link";
import { Icon } from "@/components/icons/icon";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { FillMeter } from "@/components/ui/meters";
import { Pill, type PillTone } from "@/components/ui/surface";
import type { BatchView } from "@/data/queries/batches";
import type { BatchStatus } from "@/data/types";
import { formatClock, formatKg } from "@/lib/format";

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

export const BATCH_STATUS_PILL: Record<BatchStatus, { label: string; tone: PillTone }> = {
  filling: { label: "Diisi", tone: "neutral" },
  full: { label: "Penuh", tone: "ink" },
  labelled: { label: "Label siap", tone: "ink" },
  in_transit: { label: "Di jalan", tone: "info" },
  received: { label: "Diterima", tone: "success" },
  rejected: { label: "Ditolak", tone: "danger" },
  cancelled: { label: "Dibatalkan", tone: "neutral" },
};

export function OrderCard({ view }: { view: BatchView }) {
  const status = BATCH_STATUS_PILL[view.batch.status];
  return (
    <Link
      href={`/kub/batch/${view.batch.id}`}
      className="group flex flex-col gap-3.5 rounded-[20px] border border-line bg-surface p-4 transition-[border-color,box-shadow,transform] duration-150 hover:border-ink hover:shadow-raised active:scale-[0.99] sm:p-5"
    >
      <div className="flex items-start gap-3">
        <GradeStamp grade={view.order.minimumGrade} size="sm" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="type-h3">
            {view.species.name} {view.order.minimumGrade} · {formatKg(view.targetKg)}
          </span>
          <span className="truncate text-ink-2">{view.buyer.name}</span>
          <span className="text-ink-2">{batchStatusLine(view)}</span>
        </div>
        <Pill tone={status.tone}>{status.label}</Pill>
      </div>
      <FillMeter filled={view.filledKg} target={view.targetKg} label={`${view.species.name}: ${view.filledKg} dari ${view.targetKg} kg terisi`} />
      <div className="flex items-baseline justify-between gap-3">
        <span className="type-num-m">
          {view.filledKg} <span className="text-ink-2">/ {view.targetKg} kg</span>
        </span>
        <span className={clsx("flex items-center gap-1 font-semibold", view.isFull ? "text-success-ink" : "text-ink-2")}>
          {view.isFull ? (
            <>
              <Icon name="check" size={18} /> penuh
            </>
          ) : (
            `kurang ${formatKg(view.remainingKg)}`
          )}
          <Icon name="chevronRight" size={20} className="ml-1 text-ink-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
