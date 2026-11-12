"use client";

import Link from "next/link";
import { ActiveOrderCard } from "@/components/buyer/buyer-orders-view";
import { LandingLink } from "@/components/fisher/fisher-shared";
import { Icon } from "@/components/icons/icon";
import { LandingRow } from "@/components/operator/landing-row";
import { OrderCard } from "@/components/operator/order-card";
import { MaterialCard, ProductCard } from "@/components/studio/studio-parts";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { useDemoDatabase, useDemoNow } from "@/data/demo-data-provider";
import { localDateOf } from "@/data/demo-clock";
import {
  DEMO_BUYER_ID,
  DEMO_FISHER_ID,
  DEMO_PRODUCER_ID,
} from "@/data/demo-identities";
import { batchView, batchesDeliveredOn, batchesForBuyer } from "@/data/queries/batches";
import { buyerSummary, isActiveView } from "@/data/queries/buyer-pages";
import { fisherLandings, monthSummary } from "@/data/queries/fisher-pages";
import { payoutsFor } from "@/data/queries/fishers";
import { landingsOnDate } from "@/data/queries/landings";
import {
  availableMaterialCards,
  producerProducts,
  studioStats,
} from "@/data/queries/studio-pages";
import {
  formatKg,
  formatRupiah,
  formatRupiahCompact,
  formatShortDayDate,
} from "@/lib/format";

/* Setiap potongan memakai komponen yang sama dengan halaman perannya dan data benih yang sama. */

function Stats({
  items,
}: {
  items: ReadonlyArray<{ label: string; value: string }>;
}) {
  return (
    <dl className="grid grid-cols-2 gap-2 sm:gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex min-w-0 flex-col-reverse gap-1 rounded-[20px] border border-line bg-surface px-4 py-3.5"
        >
          <dt className="text-sm text-ink-2">{item.label}</dt>
          <dd className="type-money text-[1.5rem] sm:text-[1.75rem]">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function PanelTitle({
  title,
  count,
}: {
  title: string;
  count?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h3 className="type-h3">{title}</h3>
      {count && <span className="record-number">{count}</span>}
    </div>
  );
}

export function OperatorSlice() {
  const db = useDemoDatabase();
  const now = useDemoNow();
  const today = localDateOf(now);
  const orders = batchesDeliveredOn(db, today, now).filter(
    (view) => view.batch.status !== "cancelled",
  );
  const landings = landingsOnDate(db, today);
  const landedKg = landings.reduce((sum, view) => sum + view.landing.weightKg, 0);
  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start">
      <section aria-label="Pesanan pagi ini" className="panel overflow-hidden">
        <div className="px-6 pb-1 pt-5">
          <PanelTitle title="Pesanan pagi ini" count={`${orders.length} pesanan`} />
        </div>
        {orders.slice(0, 2).map((view) => (
          <OrderCard key={view.batch.id} view={view} />
        ))}
      </section>
      <div className="flex min-w-0 flex-col gap-4">
        <Stats
          items={[
            { label: "pendaratan", value: String(landings.length) },
            { label: "tercatat", value: formatKg(landedKg) },
          ]}
        />
        <section
          aria-label="Pendaratan pagi ini"
          className="panel px-6 pb-2 pt-5"
        >
          <PanelTitle
            title="Pendaratan pagi ini"
            count={`${landings.length} catatan`}
          />
          <ul>
            {landings.slice(0, 3).map((view) => (
              <LandingRow key={view.landing.id} view={view} />
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export function FisherSlice() {
  const db = useDemoDatabase();
  const now = useDemoNow();
  const rows = fisherLandings(db, DEMO_FISHER_ID).slice(0, 3);
  const summary = monthSummary(db, DEMO_FISHER_ID, now);
  const latest = payoutsFor(db, DEMO_FISHER_ID)[0];
  const latestView = latest ? batchView(db, latest.batchId, now) : undefined;
  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
      <section aria-label="Tangkapan terbaru" className="flex flex-col gap-2">
        <h3 className="type-h3">Tangkapan terbaru</h3>
        <div className="panel px-4">
          {rows.map((row) => (
            <LandingLink key={row.view.landing.id} row={row} />
          ))}
        </div>
      </section>
      <div className="flex min-w-0 flex-col gap-4">
        <Stats
          items={[
            { label: "ikan terjual bulan ini", value: formatKg(summary.soldKg) },
            {
              label: "uang diterima",
              value: formatRupiahCompact(summary.receivedRupiah),
            },
          ]}
        />
        {latest && (
          <Link
            href={`/nelayan/uang/${latest.batchId}`}
            className="panel group flex flex-col gap-2 p-5 hover:bg-paper"
          >
            <span className="text-ink-2">
              Uang terakhir · {formatShortDayDate(latest.date)}
            </span>
            <span className="type-figure-stat break-words">
              {formatRupiah(latest.net)}
            </span>
            <span className="flex flex-wrap items-center gap-2 text-ink-2">
              {latestView?.batchGrade && (
                <GradeStamp grade={latestView.batchGrade} size="sm" />
              )}
              {formatKg(latest.kg)} {latestView?.species.name.toLowerCase()}
              {latest.deduction > 0
                ? ` · cicilan ${formatRupiah(latest.deduction)}`
                : ""}
            </span>
            <span className="inline-flex min-h-12 items-center gap-2 font-semibold text-sea-deep">
              Kenapa harganya segini <Icon name="arrowRight" size={18} />
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}

export function BuyerSlice() {
  const db = useDemoDatabase();
  const now = useDemoNow();
  const views = batchesForBuyer(db, DEMO_BUYER_ID, now);
  const summary = buyerSummary(views, now);
  const active = views.filter(isActiveView);
  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start">
      <section aria-label="Pesanan berjalan" className="flex flex-col gap-2">
        <h3 className="type-h3">Sedang berjalan</h3>
        {active.slice(0, 1).map((view) => (
          <ActiveOrderCard key={view.batch.id} view={view} />
        ))}
        {active.length === 0 && (
          <p className="panel p-5 text-ink-2">
            Tidak ada pesanan yang sedang berjalan.
          </p>
        )}
      </section>
      <Stats
        items={[
          { label: "kg diterima bulan ini", value: formatKg(summary.kgThisMonth) },
          {
            label: "belanja bulan ini",
            value: formatRupiahCompact(summary.spendThisMonth),
          },
          {
            label: "diterima / ditolak",
            value: `${summary.receivedCount} / ${summary.rejectedCount}`,
          },
          {
            label: "pesanan berjalan",
            value: String(active.length),
          },
        ]}
      />
    </div>
  );
}

export function StudioSlice() {
  const db = useDemoDatabase();
  const now = useDemoNow();
  const summaries = producerProducts(db, DEMO_PRODUCER_ID);
  const stats = studioStats(summaries);
  const materials = availableMaterialCards(db, DEMO_PRODUCER_ID, now);
  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start">
      <section aria-label="Produk" className="flex min-w-0 flex-col gap-3">
        <h3 className="type-h3">Produk Anda</h3>
        <Stats
          items={[
            { label: "produk tersimpan", value: String(stats.productCount) },
            { label: "bahan terselamatkan", value: formatKg(stats.rescuedKg) },
          ]}
        />
        {summaries.slice(0, 1).map((summary) => (
          <ProductCard key={summary.product.id} summary={summary} />
        ))}
      </section>
      <section aria-label="Bahan tersedia" className="flex min-w-0 flex-col gap-3">
        <h3 className="type-h3">Bahan tersedia</h3>
        {materials.slice(0, 1).map((item) => (
          <MaterialCard key={item.materialId} item={item} compact />
        ))}
        {materials.length === 0 && (
          <p className="panel p-5 text-ink-2">
            Belum ada ikan mutu C yang tersedia hari ini.
          </p>
        )}
      </section>
    </div>
  );
}
