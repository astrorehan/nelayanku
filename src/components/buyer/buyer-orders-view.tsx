"use client";

import { useState } from "react";
import { BuyerDocuments } from "@/components/documents/buyer-documents";
import { RoleHeader } from "@/components/layout/role-header";
import { BATCH_STATUS_PILL } from "@/components/operator/order-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { Segmented } from "@/components/ui/choices";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { Card, Pill } from "@/components/ui/surface";
import { useDemoDatabase, useDemoNow } from "@/data/demo-data-provider";
import { DEMO_BUYER_ID } from "@/data/demo-identities";
import { batchesForBuyer, type BatchView } from "@/data/queries/batches";
import { nextDeliveryDate, orderCutoff } from "@/data/queries/ordering";
import type { SpeciesId } from "@/data/types";
import {
  formatClock,
  formatDayDate,
  formatDecimal,
  formatDuration,
  formatKg,
  formatRupiah,
  formatShortDayDate,
} from "@/lib/format";
import { OrderProgress } from "./order-progress";

type SpeciesFilter = "semua" | SpeciesId;

const HISTORY_PAGE = 8;
const ACTIVE_STATUSES = new Set(["filling", "full", "labelled", "in_transit"]);

function buyerStatusLine(view: BatchView): string {
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
      return "Dibatalkan KUB, uang muka dikembalikan";
  }
}

function ActiveOrderCard({ view }: { view: BatchView }) {
  const shownKg =
    view.batch.status === "filling"
      ? `${formatDecimal(view.filledKg)} / ${view.targetKg} kg`
      : formatKg(view.filledKg || view.targetKg);
  return (
    <Card className="flex flex-col gap-4 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <GradeStamp grade={view.order.minimumGrade} size="md" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="type-h3">
            {view.species.name} · {shownKg}
          </span>
          <span className="text-ink-2">{buyerStatusLine(view)}</span>
        </div>
      </div>
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
      ) : view.contributions.length > 0 ? (
        <ButtonLink
          href={`/lacak/${view.batch.code}`}
          variant="quiet"
          size="lg"
          icon="shield"
          block
        >
          Lihat bukti mutu
        </ButtonLink>
      ) : null}
    </Card>
  );
}

function HistoryRow({ view }: { view: BatchView }) {
  const status = BATCH_STATUS_PILL[view.batch.status];
  const kg = view.receipt?.acceptedKg ?? view.filledKg;
  return (
    <tr className="border-t border-line">
      <td className="px-4 py-3">{formatShortDayDate(view.order.deliverAt)}</td>
      <td className="px-4 py-3">{view.species.name}</td>
      <td className="px-4 py-3">
        {view.batchGrade ? (
          <GradeStamp grade={view.batchGrade} size="sm" />
        ) : (
          "—"
        )}
      </td>
      <td className="tabular px-4 py-3 text-right">{formatKg(kg)}</td>
      <td className="tabular px-4 py-3 text-right">
        {formatRupiah(view.order.pricePerKg)}
      </td>
      <td className="tabular px-4 py-3 text-right font-semibold">
        {view.payment ? formatRupiah(view.payment.amount) : "—"}
      </td>
      <td className="px-4 py-3">
        <Pill tone={status.tone}>{status.label}</Pill>
      </td>
      <td className="px-4 py-3">
        {view.contributions.length > 0 && <BuyerDocuments view={view} />}
      </td>
    </tr>
  );
}

function HistoryItem({ view }: { view: BatchView }) {
  const status = BATCH_STATUS_PILL[view.batch.status];
  return (
    <li className="flex min-h-16 items-center gap-3 border-b border-line py-2.5 last:border-b-0">
      {view.batchGrade ? (
        <GradeStamp grade={view.batchGrade} size="sm" />
      ) : (
        <span className="size-9" />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-semibold">
          {view.species.name} ·{" "}
          {formatKg(view.receipt?.acceptedKg ?? view.filledKg)}
        </span>
        <span className="text-ink-2">
          {formatShortDayDate(view.order.deliverAt)} ·{" "}
          {view.payment ? formatRupiah(view.payment.amount) : status.label}
        </span>
      </div>
      {view.contributions.length > 0 && <BuyerDocuments view={view} />}
    </li>
  );
}

export function BuyerOrdersView() {
  const db = useDemoDatabase();
  const now = useDemoNow();
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesFilter>("semua");
  const [shownHistory, setShownHistory] = useState(HISTORY_PAGE);
  const buyer = db.buyers.find((candidate) => candidate.id === DEMO_BUYER_ID)!;
  const views = batchesForBuyer(db, buyer.id, now);
  const active = views.filter((view) => ACTIVE_STATUSES.has(view.batch.status));
  const history = views
    .filter((view) => !ACTIVE_STATUSES.has(view.batch.status))
    .filter(
      (view) => speciesFilter === "semua" || view.species.id === speciesFilter,
    );
  const cutoff = orderCutoff(now);
  const minutesToCutoff = Math.max(
    0,
    Math.round((cutoff.getTime() - now.getTime()) / 60_000),
  );
  const deliveryDate = nextDeliveryDate(now);

  return (
    <>
      <RoleHeader
        title={buyer.name}
        subtitle={`${buyer.contactName} · pembeli`}
        currentRole="Pembeli"
        width="wide"
      />
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-12 pt-6 sm:px-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="type-h1">Pesanan</h1>
            <p className="text-ink-2">
              Pesanan untuk {formatDayDate(`${deliveryDate}T12:00:00+07:00`)}{" "}
              ditutup {formatClock(cutoff)}
              {minutesToCutoff > 0
                ? ` (sisa ${formatDuration(minutesToCutoff)})`
                : ""}
              .
            </p>
          </div>
          <ButtonLink
            href="/pembeli/pesan"
            size="lg"
            icon="plus"
            className="w-full sm:w-auto"
          >
            Pesan untuk besok
          </ButtonLink>
        </div>

        <section aria-labelledby="berjalan" className="flex flex-col gap-3">
          <h2 id="berjalan" className="type-h3">
            Sedang berjalan
          </h2>
          {active.length === 0 ? (
            <Card tone="paper" className="p-5 text-ink-2">
              Tidak ada pesanan yang sedang berjalan.
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {active.map((view) => (
                <ActiveOrderCard key={view.batch.id} view={view} />
              ))}
            </div>
          )}
        </section>

        <section
          aria-labelledby="riwayat-pesanan"
          className="flex flex-col gap-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="riwayat-pesanan" className="type-h3">
              Riwayat
            </h2>
            <Segmented
              label="Jenis ikan"
              value={speciesFilter}
              onChange={(value) => {
                setSpeciesFilter(value);
                setShownHistory(HISTORY_PAGE);
              }}
              className="w-full sm:w-auto [&_label]:min-w-0 [&_label]:px-2 [&_label]:text-sm sm:[&_label]:px-3 sm:[&_label]:text-base"
              options={[
                { value: "semua", title: "Semua" },
                ...db.species.map((species) => ({
                  value: species.id,
                  title: species.name,
                })),
              ]}
            />
          </div>
          <Card className="hidden overflow-hidden lg:block">
            <table className="w-full text-left">
              <thead className="bg-paper-deep text-[0.9375rem] text-ink-2">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-semibold">
                    Tanggal
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">
                    Ikan
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">
                    Mutu
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2.5 text-right font-semibold"
                  >
                    Berat
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2.5 text-right font-semibold"
                  >
                    Harga/kg
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2.5 text-right font-semibold"
                  >
                    Total
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">
                    Dokumen
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, shownHistory).map((view) => (
                  <HistoryRow key={view.batch.id} view={view} />
                ))}
              </tbody>
            </table>
          </Card>
          <Card className="px-4 py-1 lg:hidden">
            <ul>
              {history.slice(0, shownHistory).map((view) => (
                <HistoryItem key={view.batch.id} view={view} />
              ))}
            </ul>
          </Card>
          {history.length === 0 && (
            <p className="text-ink-2">Belum ada riwayat untuk jenis ini.</p>
          )}
          {history.length > shownHistory && (
            <Button
              variant="quiet"
              size="md"
              block
              onClick={() => setShownHistory((count) => count + HISTORY_PAGE)}
            >
              Lihat lebih banyak ({history.length - shownHistory})
            </Button>
          )}
        </section>
      </main>
    </>
  );
}
