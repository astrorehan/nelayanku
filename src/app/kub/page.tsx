"use client";

import { Suspense, useState } from "react";
import { ConnectionStatus } from "@/components/operator/connection-status";
import { LandingRow } from "@/components/operator/landing-row";
import { OperatorTopBar } from "@/components/operator/operator-shell";
import { OrderCard } from "@/components/operator/order-card";
import { SavedLandingSheet } from "@/components/operator/saved-landing-sheet";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, Notice } from "@/components/ui/surface";
import { useDemoDatabase, useDemoNow } from "@/data/demo-data-provider";
import { localDateOf } from "@/data/demo-clock";
import { batchesDeliveredOn } from "@/data/queries/batches";
import { freshnessAlerts, landingsOnDate } from "@/data/queries/landings";
import { formatDayDate, formatDuration } from "@/lib/format";

const COLLAPSED_LANDINGS = 4;

export default function OperatorHomePage() {
  const db = useDemoDatabase();
  const now = useDemoNow();
  const [showAllLandings, setShowAllLandings] = useState(false);
  const today = localDateOf(now);
  const orders = batchesDeliveredOn(db, today, now).filter((view) => view.batch.status !== "cancelled");
  const landings = landingsOnDate(db, today);
  const alerts = freshnessAlerts(db, now).filter((alert) => alert.status !== "safe" || !alert.view.landing.iced);
  const visibleLandings = showAllLandings ? landings : landings.slice(0, COLLAPSED_LANDINGS);
  const activeOrders = orders.filter((view) => view.batch.status === "filling" || view.batch.status === "full" || view.batch.status === "labelled");

  return (
    <>
      <OperatorTopBar
        title={<span className="lg:hidden">{db.kub.name}</span>}
        subtitle={<span className="lg:hidden">{formatDayDate(now)}</span>}
      />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-8 pt-4 sm:px-6 lg:px-10 lg:pt-0">
        <div className="hidden items-end justify-between gap-4 lg:flex">
          <div className="flex flex-col gap-1">
            <h2 className="type-h1">Pagi di {db.kub.port}</h2>
            <p className="type-lead text-ink-2">
              {formatDayDate(now)} · {activeOrders.length} pesanan sedang diisi
            </p>
          </div>
          <ConnectionStatus />
        </div>

        <ButtonLink href="/kub/darat" size="xl" icon="scale" block className="lg:hidden">
          Catat pendaratan
        </ButtonLink>

        {alerts.map((alert) => (
          <Notice
            key={alert.view.landing.id}
            tone={alert.status === "expired" ? "danger" : "warning"}
            title={`${alert.view.species.name} Pak ${alert.view.fisher.name} ${alert.view.landing.iced ? "belum dinilai" : "tanpa es"}`}
            action={
              <ButtonLink href={`/kub/darat?pendaratan=${alert.view.landing.id}`} variant="secondary" size="md">
                Nilai
              </ButtonLink>
            }
          >
            {alert.status === "expired" ? "Batas waktu segar sudah lewat." : `Sisa ${formatDuration(alert.remainingMinutes)} sebelum batas segar.`}
          </Notice>
        ))}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-start">
          <section aria-labelledby="pesanan-hari-ini" className="flex flex-col gap-3">
            <h2 id="pesanan-hari-ini" className="type-h3">
              Pesanan pagi ini
            </h2>
            {orders.length === 0 ? (
              <Card tone="paper" className="flex flex-col gap-2 p-5">
                <p className="font-semibold">Belum ada pesanan untuk hari ini</p>
                <p className="text-ink-2">Ikan tetap bisa dicatat dan dinilai, lalu dijual ke TPI atau jadi bahan olahan.</p>
              </Card>
            ) : (
              orders.map((view) => <OrderCard key={view.batch.id} view={view} />)
            )}
          </section>

          <section aria-labelledby="pendaratan-hari-ini" className="flex flex-col gap-3">
            <h2 id="pendaratan-hari-ini" className="type-h3">
              Pendaratan pagi ini
            </h2>
            <Card className="px-4 py-1 sm:px-5">
              {landings.length === 0 ? (
                <p className="py-5 text-ink-2">Belum ada kapal yang mendarat.</p>
              ) : (
                <ul>
                  {visibleLandings.map((view) => (
                    <LandingRow key={view.landing.id} view={view} />
                  ))}
                </ul>
              )}
            </Card>
            {landings.length > COLLAPSED_LANDINGS && (
              <Button variant="quiet" size="md" block onClick={() => setShowAllLandings((value) => !value)}>
                {showAllLandings ? "Tampilkan lebih sedikit" : `Lihat semua (${landings.length})`}
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
