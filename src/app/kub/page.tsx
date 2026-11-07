"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { Icon, type IconName } from "@/components/icons/icon";
import { PriceTicker } from "@/components/prices/price-board";
import { ConnectionStatus } from "@/components/operator/connection-status";
import { LandingRow } from "@/components/operator/landing-row";
import { OperatorTopBar } from "@/components/operator/operator-shell";
import { OrderCard } from "@/components/operator/order-card";
import { SavedLandingSheet } from "@/components/operator/saved-landing-sheet";
import { Button, ButtonLink } from "@/components/ui/button";
import { useDemoDatabase, useDemoNow } from "@/data/demo-data-provider";
import { localDateOf } from "@/data/demo-clock";
import { batchesDeliveredOn } from "@/data/queries/batches";
import { freshnessAlerts, landingsOnDate } from "@/data/queries/landings";
import {
  formatClock,
  formatDayDate,
  formatDuration,
  formatKg,
} from "@/lib/format";

const COLLAPSED_LANDINGS = 4;
const SHORTCUTS: ReadonlyArray<{ href: string; label: string; icon: IconName }> = [
  { href: "/kub/pesanan", label: "Semua pesanan", icon: "crate" },
  { href: "/kub/anggota", label: "Anggota", icon: "people" },
  { href: "/kub/bayar", label: "Bayar & buku kas", icon: "coins" },
  { href: "/kub/dampak", label: "Dampak", icon: "impact" },
];
const orderPriority = (status: string) =>
  status === "filling" || status === "full" || status === "labelled" ? 0 : 1;

export default function OperatorHomePage() {
  const db = useDemoDatabase();
  const now = useDemoNow();
  const [showAllLandings, setShowAllLandings] = useState(false);
  const today = localDateOf(now);
  const orders = batchesDeliveredOn(db, today, now)
    .filter((view) => view.batch.status !== "cancelled")
    .sort(
      (a, b) => orderPriority(a.batch.status) - orderPriority(b.batch.status),
    );
  const landings = landingsOnDate(db, today);
  const alerts = freshnessAlerts(db, now).filter(
    (alert) => alert.status !== "safe" || !alert.view.landing.iced,
  );
  const visibleLandings = showAllLandings
    ? landings
    : landings.slice(0, COLLAPSED_LANDINGS);
  const landedKg = landings.reduce(
    (sum, view) => sum + view.landing.weightKg,
    0,
  );

  return (
    <>
      <OperatorTopBar contextOnly title={db.kub.name} subtitle={db.kub.port} />
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-8 pt-5 sm:px-8 lg:gap-8 lg:px-10 lg:pt-2"
      >
        <header className="flex flex-col gap-6">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <div className="flex flex-col gap-3">
              <p className="flex items-center gap-2 text-ink-2">
                <span className="docket-eye" aria-hidden />
                {formatDayDate(now)}, pukul{" "}
                <span className="tabular">{formatClock(now)}</span> WIB
              </p>
              <h2 className="type-title">Catatan dermaga</h2>
            </div>
            <ConnectionStatus className="rounded-full bg-surface px-3.5 py-2" />
          </div>
          <dl className="grid grid-cols-3 gap-2 sm:gap-3 lg:max-w-2xl">
            {[
              { label: "pendaratan", value: String(landings.length) },
              { label: "tercatat", value: formatKg(landedKg) },
              { label: "pesanan", value: String(orders.length) },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col-reverse gap-1 rounded-[20px] bg-surface px-4 py-3.5 sm:px-5"
              >
                <dt className="text-sm text-ink-2">{stat.label}</dt>
                <dd className="type-money text-[1.5rem] sm:text-[1.875rem]">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
          <ButtonLink
            href="/kub/darat"
            size="lg"
            icon="scale"
            block
            className="lg:hidden"
          >
            Catat pendaratan
          </ButtonLink>
        </header>
        <nav aria-label="Pintasan" className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {SHORTCUTS.map((shortcut) => (
            <Link
              key={shortcut.href}
              href={shortcut.href}
              className="flex min-h-14 items-center gap-3 rounded-full border border-line bg-surface px-4 font-semibold transition-colors hover:border-line-strong hover:bg-paper"
            >
              <Icon name={shortcut.icon} size={20} className="shrink-0 text-sea-deep" />
              <span className="min-w-0 leading-tight">{shortcut.label}</span>
            </Link>
          ))}
        </nav>
        {alerts.length > 0 && (
          <section aria-label="Perlu diperiksa" className="flex flex-col gap-3">
            {alerts.map((alert) => (
              <div
                className="dock-attention flex items-center justify-between gap-4"
                data-expired={alert.status === "expired"}
                key={alert.view.landing.id}
              >
                <div>
                  <p className="mb-1 text-sm font-medium text-warning-ink">
                    Perlu dinilai
                  </p>
                  <p className="font-medium">
                    {alert.view.species.name} Pak {alert.view.fisher.name}
                  </p>
                  <p className="mt-1 text-ink-2">
                    {!alert.view.landing.iced && "Tanpa es · "}
                    {alert.status === "expired"
                      ? "Batas waktu segar sudah lewat"
                      : `Sisa ${formatDuration(alert.remainingMinutes)}`}
                  </p>
                </div>
                <ButtonLink
                  href={`/kub/darat?pendaratan=${alert.view.landing.id}`}
                  variant="accent"
                  size="md"
                  className="shrink-0"
                >
                  Nilai
                </ButtonLink>
              </div>
            ))}
          </section>
        )}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <section
            aria-labelledby="pesanan-hari-ini"
            className="panel overflow-hidden"
          >
            <div className="flex items-baseline justify-between gap-4 px-6 pb-2 pt-5">
              <h2 id="pesanan-hari-ini" className="type-h2">
                Pesanan pagi ini
              </h2>
              <span className="record-number">{orders.length} pesanan</span>
            </div>
            {orders.length === 0 ? (
              <p className="px-6 pb-6 pt-2 text-ink-2">
                Belum ada pesanan hari ini. Ikan tetap bisa dinilai untuk TPI
                atau bahan olahan.
              </p>
            ) : (
              orders.map((view) => (
                <OrderCard key={view.batch.id} view={view} />
              ))
            )}
          </section>
          <section
            aria-labelledby="pendaratan-hari-ini"
            className="panel px-6 pb-3 pt-5"
          >
            <div className="flex items-baseline justify-between gap-4 pb-2">
              <h2 id="pendaratan-hari-ini" className="type-h2">
                Pendaratan pagi ini
              </h2>
              <span className="record-number">{landings.length} catatan</span>
            </div>
            {landings.length === 0 ? (
              <p className="py-6 text-ink-2">Belum ada kapal yang mendarat</p>
            ) : (
              <ul>
                {visibleLandings.map((view) => (
                  <LandingRow key={view.landing.id} view={view} />
                ))}
              </ul>
            )}
            {landings.length > COLLAPSED_LANDINGS && (
              <Button
                variant="secondary"
                size="md"
                block
                className="mb-3 mt-2"
                onClick={() => setShowAllLandings((value) => !value)}
              >
                {showAllLandings
                  ? "Tampilkan lebih sedikit"
                  : `Lihat semua (${landings.length})`}
              </Button>
            )}
          </section>
        </div>
        <PriceTicker href="/kub/harga" />
      </main>
      <Suspense fallback={null}>
        <SavedLandingSheet />
      </Suspense>
    </>
  );
}
