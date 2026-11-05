"use client";

import { useState, type ReactNode } from "react";
import { OperatorTopBar } from "@/components/operator/operator-shell";
import { Segmented } from "@/components/ui/choices";
import { Card, Pill, SourceNote } from "@/components/ui/surface";
import { useDemoDatabase, useDemoNow } from "@/data/demo-data-provider";
import { addDays, localDateOf } from "@/data/demo-clock";
import { impactMetrics } from "@/data/queries/impact";
import { formatKg, formatNumber, formatPercent, formatRupiah, formatRupiahCompact } from "@/lib/format";
import { DestinationSplit } from "./destination-split";
import { PriceTrendChart } from "./price-trend-chart";

type RangeDays = "7" | "14" | "30";

const RANGE_OPTIONS: Array<{ value: RangeDays; title: string }> = [
  { value: "7", title: "7 hari" },
  { value: "14", title: "14 hari" },
  { value: "30", title: "30 hari" },
];

function StatTile({ label, value, note }: { label: string; value: ReactNode; note: string }) {
  return (
    <Card className="flex flex-col gap-1.5 p-4 sm:p-5">
      <span className="text-ink-2">{label}</span>
      <span className="type-figure-stat">{value}</span>
      <span className="text-[0.9375rem] leading-snug text-ink-2">{note}</span>
    </Card>
  );
}

export function ImpactView() {
  const db = useDemoDatabase();
  const now = useDemoNow();
  const [rangeDays, setRangeDays] = useState<RangeDays>("30");
  const toDate = localDateOf(now);
  const metrics = impactMetrics(db, { fromDate: addDays(toDate, -(Number(rangeDays) - 1)), toDate });
  const { onTimePayments, activeFishers } = metrics;

  return (
    <>
      <OperatorTopBar title="Dampak" subtitle={<span className="lg:hidden">{db.kub.name}</span>} />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-8 pt-4 sm:px-6 lg:px-10 lg:pt-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-ink-2">
            {db.kub.name} · dihitung dari {formatNumber(metrics.deliveredBatchCount)} kiriman diterima dan {formatNumber(metrics.landingCount)} pendaratan
          </p>
          <Segmented label="Rentang waktu" value={rangeDays} onChange={setRangeDays} options={RANGE_OPTIONS} className="w-full sm:w-80" />
        </div>

        <section aria-label="Angka utama" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Card tone="ink" className="col-span-2 flex flex-col gap-2 p-5 sm:p-6 lg:row-span-2">
            <span className="text-paper/80">Tambahan untuk nelayan</span>
            <span className="type-figure-hero text-paper">{formatRupiahCompact(metrics.extraIncomeVsPortPrice)}</span>
            <span className="leading-snug text-paper/80">
              Dibanding kalau {formatKg(metrics.kgSoldViaOrders)} yang lewat pesanan dijual dengan harga TPI hari itu.
            </span>
            {metrics.kgSoldViaOrders > 0 && (
              <span className="mt-auto flex items-baseline justify-between gap-3 border-t border-paper/20 pt-3 text-paper/80">
                Rata-rata per kg
                <b className="tabular text-lg text-paper">+{formatRupiah(Math.round(metrics.extraIncomeVsPortPrice / metrics.kgSoldViaOrders))}</b>
              </span>
            )}
          </Card>
          <StatTile label="Terjual lewat pesanan" value={formatKg(metrics.kgSoldViaOrders)} note={`dari ${formatNumber(metrics.deliveredBatchCount)} kiriman diterima`} />
          <StatTile label="Mutu C terolah" value={formatKg(metrics.processedKg)} note="diambil pengolah, tidak terbuang" />
          <StatTile
            label="Tepat bayar"
            value={onTimePayments.total ? formatPercent(onTimePayments.onTime / onTimePayments.total) : "—"}
            note={`${onTimePayments.onTime} dari ${onTimePayments.total} kiriman`}
          />
          <StatTile label="Nelayan aktif" value={formatNumber(activeFishers.active)} note={`dari ${activeFishers.total} anggota`} />
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
          <Card className="flex flex-col gap-4 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="type-h3">Harga tongkol per kg: diterima nelayan dan TPI</h2>
              <Pill tone="neutral">Tren, bukan ramalan</Pill>
            </div>
            <PriceTrendChart points={metrics.priceComparison} speciesName="Tongkol" />
            <SourceNote simulated>TPI: PIPP KKP. Nelayan: transaksi KUB di demo ini. Titik hijau = hari ada kiriman tongkol diterima.</SourceNote>
          </Card>
          <Card className="flex flex-col gap-4 p-4 sm:p-6">
            <h2 className="type-h3">Ke mana ikan pergi</h2>
            <DestinationSplit destinationKg={metrics.destinationKg} />
            <p className="text-[0.9375rem] leading-snug text-ink-2">Berat dari semua pendaratan yang sudah diberi tujuan di rentang ini.</p>
          </Card>
        </div>
      </main>
    </>
  );
}
