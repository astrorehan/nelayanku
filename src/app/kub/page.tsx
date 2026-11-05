"use client";

import { Suspense, useState } from "react";
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
        className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 pb-8 pt-6 sm:px-8 lg:px-10 lg:pt-2"
      >
        <header className="flex flex-col gap-5 border-b border-line pb-6">
          <div className="flex items-center justify-between gap-4 text-ink-2">
            <p className="flex items-center gap-2 text-sm">
              <span className="docket-eye" aria-hidden />
              {formatDayDate(now)}
            </p>
            <span className="type-code text-sm">{formatClock(now)} WIB</span>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-[2.125rem] font-medium leading-tight tracking-[-0.02em] sm:text-[2.75rem]">
                Catatan dermaga
              </h2>
              <p className="mt-3 text-ink-2">
                {landings.length} pendaratan · {formatKg(landedKg)} tercatat
              </p>
            </div>
            <ConnectionStatus />
          </div>
          <ButtonLink
            href="/kub/darat"
            size="lg"
            iconAfter="plus"
            block
            className="justify-between lg:hidden"
          >
            Catat pendaratan
          </ButtonLink>
        </header>
        {alerts.length > 0 && (
          <section aria-label="Perlu diperiksa" className="flex flex-col gap-4">
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
                  variant="ghost"
                  size="md"
                  iconAfter="arrowRight"
                  className="shrink-0"
                >
                  Nilai
                </ButtonLink>
              </div>
            ))}
          </section>
        )}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12">
          <section aria-labelledby="pesanan-hari-ini">
            <div className="record-heading">
              <h2 id="pesanan-hari-ini" className="text-lg font-medium">
                Pesanan pagi ini
              </h2>
              <span className="record-number">{orders.length} pesanan</span>
            </div>
            {orders.length === 0 ? (
              <p className="py-6 text-ink-2">
                Belum ada pesanan hari ini. Ikan tetap bisa dinilai untuk TPI
                atau bahan olahan.
              </p>
            ) : (
              orders.map((view) => (
                <OrderCard key={view.batch.id} view={view} />
              ))
            )}
          </section>
          <section aria-labelledby="pendaratan-hari-ini">
            <div className="record-heading">
              <h2 id="pendaratan-hari-ini" className="text-lg font-medium">
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
                variant="ghost"
                size="md"
                block
                iconAfter="arrowRight"
                className="mt-3 justify-between px-0"
                onClick={() => setShowAllLandings((value) => !value)}
              >
                {showAllLandings
                  ? "Tampilkan lebih sedikit"
                  : `Lihat semua (${landings.length})`}
              </Button>
            )}
          </section>
        </div>
      </main>
      <Suspense fallback={null}>
        <SavedLandingSheet />
      </Suspense>
    </>
  );
}
