"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icons/icon";
import { RolePage } from "@/components/layout/role-shell";
import { FisherTopBar } from "@/components/shells/role-shells";
import { ButtonLink } from "@/components/ui/button";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { Card, Notice } from "@/components/ui/surface";
import { GRADE_LABEL } from "@/content/labels";
import { useDemoNow, useRepository } from "@/data/demo-data-provider";
import { localDateOf } from "@/data/demo-clock";
import { batchView } from "@/data/queries/batches";
import { monthSummary, landingStatus, type FisherLandingRow } from "@/data/queries/fisher-pages";
import { debtSummary, installmentAwaitingPayment, payoutsFor } from "@/data/queries/fishers";
import { landingOutcome, landingsOnDate } from "@/data/queries/landings";
import { formatDayDate, formatKg, formatRupiah, formatRupiahCompact, formatShortDayDate } from "@/lib/format";
import { DeductionDecision } from "./deduction-decision";
import { LandingLink, useFisher } from "./fisher-shared";

function BigNumber({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <Card className="flex min-h-32 flex-col justify-between gap-2 p-4">
      <p className="leading-snug text-ink-2">{label}</p>
      <div className="type-money text-[1.75rem]">{children}</div>
      {hint && <p className="text-[0.9375rem] leading-snug text-ink-2">{hint}</p>}
    </Card>
  );
}

export function FisherHome() {
  const { db, fisher } = useFisher();
  const now = useDemoNow();
  const repository = useRepository();
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const debt = debtSummary(db, fisher.id);
  const awaiting = installmentAwaitingPayment(db, fisher.id);
  const payouts = payoutsFor(db, fisher.id);
  const latest = payouts[0];
  const latestView = latest ? batchView(db, latest.batchId, now) : undefined;
  const summary = monthSummary(db, fisher.id, now);
  const todays: FisherLandingRow[] = landingsOnDate(db, localDateOf(now))
    .filter((view) => view.fisher.id === fisher.id)
    .map((view) => ({
      view,
      date: localDateOf(view.landing.landedAt),
      status: landingStatus(db, view.landing.id, fisher.id),
    }));

  const decide = async (approve: boolean) => {
    if (!awaiting) {
      return;
    }
    setBusy(true);
    setFailure(null);
    try {
      await repository.decideDeduction({
        entryId: awaiting.id,
        approve,
        via: "link",
      });
    } catch {
      setFailure("Keputusan belum tersimpan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <FisherTopBar title={`Pak ${fisher.name}`} subtitle={db.kub.name} />
      <RolePage>
        <p className="text-ink-2">{formatDayDate(now)}</p>
        {failure && <Notice tone="danger" title={failure} />}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
          <div className="flex flex-col gap-6">
            {awaiting && (
              <DeductionDecision
                key={awaiting.id}
                entry={awaiting}
                lender={debt.lenders.find((lender) => lender.lender === awaiting.counterparty)}
                busy={busy}
                onDecide={(approve) => void decide(approve)}
              />
            )}

            <section aria-labelledby="hari-ini" className="flex flex-col gap-2">
              <h2 id="hari-ini" className="type-h3">
                Tangkapan hari ini
              </h2>
              {todays.length === 0 ? (
                <Card tone="paper" className="flex flex-col items-start gap-3 p-5">
                  <p className="text-ink-2">
                    Belum ada tangkapan Bapak yang dicatat hari ini. Begitu Bapak sandar, operator KUB mencatat dan
                    menilai ikannya, lalu muncul di sini.
                  </p>
                  <ButtonLink href="/nelayan/tangkapan" variant="secondary" size="md">
                    Lihat tangkapan sebelumnya
                  </ButtonLink>
                </Card>
              ) : (
                <>
                  <Card className="px-4">
                    {todays.map((row) => (
                      <LandingLink key={row.view.landing.id} row={row} />
                    ))}
                  </Card>
                  {todays.map((row) => {
                    const outcome = landingOutcome(db, row.view.landing.id, now);
                    if (!outcome || outcome.payoutEstimate <= 0) {
                      return null;
                    }
                    return (
                      <p key={row.view.landing.id} className="leading-snug text-ink-2">
                        Perkiraan {formatKg(row.view.landing.weightKg)} {row.view.species.name.toLowerCase()}:{" "}
                        <b className="text-ink">{formatRupiah(outcome.payoutEstimate)}</b>
                        {outcome.destination === "batch" ? ", dibayar setelah pembeli menerima ikan." : "."}
                      </p>
                    );
                  })}
                </>
              )}
            </section>
          </div>

          <div className="flex flex-col gap-6">
            <section aria-labelledby="bulan-ini" className="flex flex-col gap-2">
              <h2 id="bulan-ini" className="type-h3">
                Bulan ini
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <BigNumber label="Ikan terjual">{formatKg(summary.soldKg)}</BigNumber>
                <BigNumber label="Mutu terbanyak">
                  {summary.topGrade ? (
                    <span className="flex items-center gap-2">
                      <GradeStamp grade={summary.topGrade} size="sm" />
                      <span className="text-lg">{GRADE_LABEL[summary.topGrade]}</span>
                    </span>
                  ) : (
                    "-"
                  )}
                </BigNumber>
                <BigNumber label="Uang diterima">{formatRupiahCompact(summary.receivedRupiah)}</BigNumber>
                <BigNumber label="Sisa pinjaman">{formatRupiahCompact(summary.outstandingDebt)}</BigNumber>
              </div>
              <Link
                href="/nelayan/pinjaman"
                className="inline-flex min-h-12 items-center gap-2 font-semibold text-sea-deep"
              >
                Lihat buku kas pinjaman <Icon name="arrowRight" size={18} />
              </Link>
            </section>

            {latest ? (
              <Link href={`/nelayan/uang/${latest.batchId}`} className="group block rounded-[20px]">
                <Card className="flex flex-col gap-2 p-5 group-hover:bg-paper">
                  <p className="text-ink-2">Uang terakhir · {formatShortDayDate(latest.date)}</p>
                  <p className="type-figure-stat">{formatRupiah(latest.net)}</p>
                  <p className="flex flex-wrap items-center gap-2 text-ink-2">
                    {latestView?.batchGrade && <GradeStamp grade={latestView.batchGrade} size="sm" />}
                    {formatKg(latest.kg)} {latestView?.species.name.toLowerCase()}
                    {latest.deduction > 0 ? ` · cicilan ${formatRupiah(latest.deduction)}` : ""}
                  </p>
                  <span className="mt-1 inline-flex min-h-12 items-center gap-2 font-semibold text-sea-deep">
                    Kenapa harganya segini <Icon name="arrowRight" size={18} />
                  </span>
                </Card>
              </Link>
            ) : (
              <Card tone="paper" className="p-5 text-ink-2">
                Belum ada uang dari pesanan. Setelah pembeli menerima kiriman, hasilnya muncul di sini.
              </Card>
            )}
          </div>
        </div>
      </RolePage>
    </>
  );
}
