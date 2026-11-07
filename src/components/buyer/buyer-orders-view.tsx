"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icons/icon";
import { BATCH_STATUS_PILL } from "@/components/operator/order-card";
import { BuyerTopBar } from "@/components/shells/role-shells";
import { RolePage } from "@/components/layout/role-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { Card, Pill } from "@/components/ui/surface";
import { useDemoDatabase, useDemoNow } from "@/data/demo-data-provider";
import { DEMO_BUYER_ID } from "@/data/demo-identities";
import { batchesForBuyer, type BatchView } from "@/data/queries/batches";
import {
  filterCounts,
  groupByMonth,
  matchesOrderFilter,
  orderKg,
  ORDER_FILTERS,
  orderTotal,
  type OrderFilter,
} from "@/data/queries/buyer-pages";
import type { SpeciesId } from "@/data/types";
import {
  formatClock,
  formatDecimal,
  formatKg,
  formatRupiah,
  formatShortDayDate,
} from "@/lib/format";
import { OrderProgress } from "./order-progress";

type SpeciesFilter = "semua" | SpeciesId;

const PAGE_SIZE = 12;

const monthFormat = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
export const formatMonth = (firstDay: string) =>
  monthFormat.format(new Date(`${firstDay}T12:00:00Z`));

export function buyerStatusLine(view: BatchView): string {
  const deliver = formatClock(view.order.deliverAt);
  switch (view.batch.status) {
    case "filling":
      return `Sedang diisi di dermaga · kirim ${deliver}`;
    case "full":
      return `Sudah penuh, menunggu label · kirim ${deliver}`;
    case "labelled":
      return `Label siap, segera berangkat · kirim ${deliver}`;
    case "in_transit":
      return `Dalam perjalanan sejak ${formatClock(view.batch.departedAt!)} · kurir ${view.batch.checklist?.courier ?? "KUB"}`;
    case "received":
      return `Diterima ${view.receipt ? formatShortDayDate(view.receipt.receivedAt) : ""}`;
    case "rejected":
      return "Ditolak saat diterima";
    case "cancelled":
      return "Dibatalkan KUB, uang muka dikembalikan (simulasi)";
  }
}

/** Card for an order that is still moving, with progress and the next step. */
export function ActiveOrderCard({ view }: { view: BatchView }) {
  const shownKg =
    view.batch.status === "filling"
      ? `${formatDecimal(view.filledKg)} / ${view.targetKg} kg`
      : formatKg(view.filledKg || view.targetKg);
  return (
    <Card className="flex flex-col gap-4 p-4 sm:p-5">
      <Link
        href={`/pembeli/pesanan/${view.batch.code}`}
        className="-m-1 flex items-start gap-3 rounded-[16px] p-1 hover:bg-paper"
      >
        <GradeStamp grade={view.order.minimumGrade} size="md" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="type-h3">
            {view.species.name} · {shownKg}
          </span>
          <span className="text-ink-2">{buyerStatusLine(view)}</span>
          <span className="type-code text-ink-2">{view.batch.code}</span>
        </div>
        <Icon
          name="chevronRight"
          size={22}
          className="mt-2 shrink-0 text-ink-2"
        />
      </Link>
      <OrderProgress status={view.batch.status} />
      {view.batch.status === "in_transit" ? (
        <ButtonLink
          href={`/pembeli/terima/${view.batch.code}`}
          size="lg"
          icon="coolBox"
          block
        >
          Terima kiriman
        </ButtonLink>
      ) : (
        <ButtonLink
          href={`/pembeli/pesanan/${view.batch.code}`}
          variant="quiet"
          size="lg"
          block
        >
          Lihat rincian
        </ButtonLink>
      )}
    </Card>
  );
}

/** One order as a row that opens its detail page. */
export function OrderRow({ view }: { view: BatchView }) {
  const status = BATCH_STATUS_PILL[view.batch.status];
  const kg = orderKg(view) || view.filledKg;
  return (
    <li className="border-b border-line last:border-b-0">
      <Link
        href={`/pembeli/pesanan/${view.batch.code}`}
        className="flex min-h-16 items-center gap-3 px-4 py-2.5 hover:bg-paper"
      >
        {view.batchGrade ? (
          <GradeStamp grade={view.batchGrade} size="sm" />
        ) : (
          <span aria-hidden className="size-9 shrink-0" />
        )}
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-semibold">
            {view.species.name} · {formatKg(kg)}
          </span>
          <span className="truncate text-ink-2">
            {formatShortDayDate(view.order.deliverAt)} ·{" "}
            <span className="type-code">{view.batch.code}</span>
          </span>
        </span>
        <span className="hidden flex-col items-end sm:flex">
          <span className="tabular font-semibold">
            {formatRupiah(orderTotal(view))}
          </span>
          <span className="tabular text-ink-2">
            {formatRupiah(view.order.pricePerKg)}/kg
          </span>
        </span>
        <Pill tone={status.tone}>{status.label}</Pill>
        <Icon
          name="chevronRight"
          size={20}
          className="shrink-0 text-ink-2"
        />
      </Link>
    </li>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={clsx(
        "inline-flex min-h-12 items-center gap-1.5 rounded-full border px-4 font-semibold transition-colors",
        active
          ? "border-sea bg-sky-tint text-sea-deep"
          : "border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

export function BuyerOrdersView() {
  const db = useDemoDatabase();
  const now = useDemoNow();
  const [statusFilter, setStatusFilter] = useState<OrderFilter>("semua");
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesFilter>("semua");
  const [shown, setShown] = useState(PAGE_SIZE);
  const views = batchesForBuyer(db, DEMO_BUYER_ID, now);
  const counts = filterCounts(views);
  const filtered = views.filter(
    (view) =>
      matchesOrderFilter(view, statusFilter) &&
      (speciesFilter === "semua" || view.species.id === speciesFilter),
  );
  const visible = filtered.slice(0, shown);
  const groups = groupByMonth(visible);
  const reset = () => setShown(PAGE_SIZE);

  return (
    <>
      <BuyerTopBar
        title="Pesanan"
        subtitle={`${counts.semua} pesanan · ${counts.berjalan} berjalan`}
      />
      <RolePage>
        <div className="flex flex-col gap-3">
          <div
            role="group"
            aria-label="Status pesanan"
            className="flex flex-wrap gap-2"
          >
            {ORDER_FILTERS.map((option) => (
              <Chip
                key={option.value}
                active={statusFilter === option.value}
                onClick={() => {
                  setStatusFilter(option.value);
                  reset();
                }}
              >
                {option.title}
                <span className="tabular font-normal text-ink-2">
                  {counts[option.value]}
                </span>
              </Chip>
            ))}
          </div>
          <div
            role="group"
            aria-label="Jenis ikan"
            className="flex flex-wrap gap-2"
          >
            <Chip
              active={speciesFilter === "semua"}
              onClick={() => {
                setSpeciesFilter("semua");
                reset();
              }}
            >
              Semua ikan
            </Chip>
            {db.species.map((species) => (
              <Chip
                key={species.id}
                active={speciesFilter === species.id}
                onClick={() => {
                  setSpeciesFilter(species.id);
                  reset();
                }}
              >
                {species.name}
              </Chip>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <Card tone="paper" className="flex flex-col items-start gap-3 p-5">
            <p className="font-semibold">Belum ada pesanan yang cocok</p>
            <p className="text-ink-2">
              {views.length === 0
                ? "Pesan untuk besok, lalu KUB mengisinya dari tangkapan pagi."
                : "Coba pilih status atau jenis ikan lain."}
            </p>
            {views.length === 0 ? (
              <ButtonLink href="/pembeli/pesan" icon="plus">
                Pesan untuk besok
              </ButtonLink>
            ) : (
              <Button
                variant="quiet"
                onClick={() => {
                  setStatusFilter("semua");
                  setSpeciesFilter("semua");
                }}
              >
                Tampilkan semua
              </Button>
            )}
          </Card>
        ) : (
          groups.map((group) => (
            <section
              key={group.key}
              aria-labelledby={`bulan-${group.key}`}
              className="flex flex-col gap-2"
            >
              <h2 id={`bulan-${group.key}`} className="type-h3">
                {formatMonth(group.firstDay)}
              </h2>
              <Card className="overflow-hidden">
                <ul>
                  {group.views.map((view) => (
                    <OrderRow key={view.batch.id} view={view} />
                  ))}
                </ul>
              </Card>
            </section>
          ))
        )}
        {filtered.length > shown && (
          <Button
            variant="quiet"
            size="md"
            block
            onClick={() => setShown((count) => count + PAGE_SIZE)}
          >
            Lihat lebih banyak ({filtered.length - shown})
          </Button>
        )}
      </RolePage>
    </>
  );
}
