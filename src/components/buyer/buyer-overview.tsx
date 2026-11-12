"use client";

import Link from "next/link";
import { Icon } from "@/components/icons/icon";
import { RolePage } from "@/components/layout/role-shell";
import { BuyerTopBar } from "@/components/shells/role-shells";
import { ButtonLink } from "@/components/ui/button";
import { Card, Notice, Pill } from "@/components/ui/surface";
import { useDemoDatabase, useDemoNow } from "@/data/demo-data-provider";
import { DEMO_BUYER_ID } from "@/data/demo-identities";
import { batchesForBuyer } from "@/data/queries/batches";
import {
  buyerActions,
  buyerSummary,
  dailyKg,
  isActiveView,
  type DailyKg,
} from "@/data/queries/buyer-pages";
import { nextDeliveryDate, orderCutoff } from "@/data/queries/ordering";
import {
  formatClock,
  formatDayDate,
  formatDuration,
  formatKg,
  formatRupiahCompact,
  formatScore,
  formatShortDate,
} from "@/lib/format";
import { ActiveOrderCard } from "./buyer-orders-view";

function KgBars({ series }: { series: DailyKg[] }) {
  const max = Math.max(1, ...series.map((entry) => entry.kg));
  const width = 300;
  const height = 96;
  const gap = 2;
  const barWidth = (width - gap * (series.length - 1)) / series.length;
  const total = series.reduce((sum, entry) => sum + entry.kg, 0);
  return (
    <figure className="flex flex-col gap-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Kiriman diterima 30 hari terakhir, total ${formatKg(total)}`}
        className="h-24 w-full"
        preserveAspectRatio="none"
      >
        <line
          x1="0"
          x2={width}
          y1={height - 0.5}
          y2={height - 0.5}
          stroke="var(--color-line)"
        />
        {series.map((entry, index) => {
          const barHeight = entry.kg > 0 ? Math.max(3, (entry.kg / max) * (height - 4)) : 0;
          return (
            <rect
              key={entry.date}
              x={index * (barWidth + gap)}
              y={height - 1 - barHeight}
              width={barWidth}
              height={barHeight}
              rx="1.5"
              fill="var(--color-sea)"
            >
              <title>{`${formatShortDate(`${entry.date}T12:00:00+07:00`)}: ${formatKg(entry.kg)}`}</title>
            </rect>
          );
        })}
      </svg>
      <figcaption className="flex justify-between text-[0.875rem] text-ink-2">
        <span>{formatShortDate(`${series[0].date}T12:00:00+07:00`)}</span>
        <span>
          {total > 0 ? `Total ${formatKg(total)}` : "Belum ada kiriman diterima"}
        </span>
        <span>{formatShortDate(`${series[series.length - 1].date}T12:00:00+07:00`)}</span>
      </figcaption>
    </figure>
  );
}

export function BuyerOverview() {
  const db = useDemoDatabase();
  const now = useDemoNow();
  const buyer = db.buyers.find((candidate) => candidate.id === DEMO_BUYER_ID)!;
  const views = batchesForBuyer(db, buyer.id, now);
  const summary = buyerSummary(views, now);
  const active = views.filter(isActiveView);
  const actions = buyerActions(views);
  const series = dailyKg(views, now, 30);
  const cutoff = orderCutoff(now);
  const minutesToCutoff = Math.max(
    0,
    Math.round((cutoff.getTime() - now.getTime()) / 60_000),
  );
  const deliveryDate = nextDeliveryDate(now);

  const tiles = [
    { label: "kg diterima bulan ini", value: formatKg(summary.kgThisMonth) },
    {
      label: "belanja bulan ini",
      value: formatRupiahCompact(summary.spendThisMonth),
    },
    {
      label: "mutu rata-rata (skor)",
      value:
        summary.averageScore !== null ? formatScore(summary.averageScore) : "—",
    },
    {
      label: "diterima / ditolak",
      value: `${summary.receivedCount} / ${summary.rejectedCount}`,
    },
  ];

  return (
    <>
      <BuyerTopBar
        title="Ringkasan"
        subtitle={`${buyer.name} · ${buyer.contactName}`}
      />
      <RolePage className="gap-6 lg:gap-8">
        <dl className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          {tiles.map((tile) => (
            <div
              key={tile.label}
              className="flex flex-col-reverse gap-1 rounded-[20px] border border-line bg-surface px-4 py-3.5 sm:px-5"
            >
              <dt className="text-sm text-ink-2">{tile.label}</dt>
              <dd className="type-money text-[1.5rem] sm:text-[1.875rem]">
                {tile.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-8">
          <div className="flex min-w-0 flex-col gap-6">
            <section aria-labelledby="berjalan" className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <h2 id="berjalan" className="type-h3">
                  Sedang berjalan
                </h2>
                <Link
                  href="/pembeli/pesanan"
                  className="inline-flex min-h-12 items-center font-semibold text-sea-deep hover:underline"
                >
                  Semua pesanan
                </Link>
              </div>
              {active.length === 0 ? (
                <Card tone="paper" className="flex flex-col items-start gap-3 p-5">
                  <p className="text-ink-2">
                    Tidak ada pesanan yang sedang berjalan. Pesan sebelum{" "}
                    {formatClock(cutoff)} agar masuk jadwal besok.
                  </p>
                  <ButtonLink href="/pembeli/pesan" icon="plus">
                    Pesan untuk besok
                  </ButtonLink>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {active.map((view) => (
                    <ActiveOrderCard key={view.batch.id} view={view} />
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            <section aria-labelledby="tindakan" className="flex flex-col gap-3">
              <h2 id="tindakan" className="type-h3">
                Perlu tindakan
              </h2>
              {actions.length === 0 ? (
                <Card tone="paper" className="p-5 text-ink-2">
                  Tidak ada yang perlu Anda lakukan sekarang.
                </Card>
              ) : (
                <Card className="overflow-hidden">
                  <ul>
                    {actions.map((action) => (
                      <li
                        key={`${action.kind}-${action.view.batch.id}`}
                        className="border-b border-line last:border-b-0"
                      >
                        <Link
                          href={action.href}
                          className="flex min-h-16 items-center gap-3 px-4 py-3 hover:bg-paper"
                        >
                          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sky-tint text-sea-deep">
                            <Icon
                              name={action.kind === "receive" ? "coolBox" : "ledger"}
                              size={22}
                            />
                          </span>
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="font-semibold">{action.title}</span>
                            <span className="text-ink-2">{action.detail}</span>
                          </span>
                          <Pill tone={action.kind === "receive" ? "info" : "neutral"}>
                            {action.actionLabel}
                          </Pill>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </section>

            <Notice tone="info" title="Jadwal pesan" icon="clock">
              Pesanan untuk {formatDayDate(`${deliveryDate}T12:00:00+07:00`)}{" "}
              ditutup pukul {formatClock(cutoff)}
              {minutesToCutoff > 0
                ? `, sisa ${formatDuration(minutesToCutoff)}.`
                : ". Batas hari ini sudah lewat, pesanan baru masuk jadwal berikutnya."}
            </Notice>
            <ButtonLink
              href="/pembeli/pesan"
              size="lg"
              icon="plus"
              block
              className="lg:hidden"
            >
              Pesan untuk besok
            </ButtonLink>

            <section aria-labelledby="grafik" className="flex flex-col gap-3">
              <h2 id="grafik" className="type-h3">
                Kiriman diterima, 30 hari
              </h2>
              <Card className="p-4 sm:p-5">
                <KgBars series={series} />
              </Card>
            </section>
          </div>
        </div>
      </RolePage>
    </>
  );
}
