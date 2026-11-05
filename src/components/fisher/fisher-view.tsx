"use client";

import { useState } from "react";
import { Icon } from "@/components/icons/icon";
import { RoleHeader } from "@/components/layout/role-header";
import { Button } from "@/components/ui/button";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { FillMeter } from "@/components/ui/meters";
import { Card, Notice, Pill } from "@/components/ui/surface";
import { GRADE_SPOKEN } from "@/content/labels";
import { useDemoDatabase, useDemoNow, useRepository } from "@/data/demo-data-provider";
import { localDateOf } from "@/data/demo-clock";
import { DEMO_FISHER_ID } from "@/data/demo-identities";
import { batchView } from "@/data/queries/batches";
import { debtSummary, installmentAwaitingPayment, payoutsFor, type Payout } from "@/data/queries/fishers";
import { landingOutcome, landingsOnDate } from "@/data/queries/landings";
import type { DemoDatabase } from "@/data/types";
import { formatClock, formatKg, formatRupiah, formatShortDayDate } from "@/lib/format";
import { DeductionDecision } from "./deduction-decision";

const HISTORY_PAGE = 5;

function payoutCatch(db: DemoDatabase, payout: Payout, now: Date) {
  const view = batchView(db, payout.batchId, now);
  return {
    grade: view?.batchGrade ?? view?.order.minimumGrade ?? null,
    species: view?.species.name.toLowerCase() ?? "ikan",
    code: view?.batch.code ?? "",
  };
}

function historyCsv(db: DemoDatabase, payouts: Payout[], now: Date): string {
  const header = ["Tanggal", "Kode kiriman", "Ikan", "Berat (kg)", "Mutu", "Kotor (Rp)", "Potongan (Rp)", "Bersih (Rp)"];
  const rows = payouts.map((payout) => {
    const detail = payoutCatch(db, payout, now);
    return [localDateOf(payout.date), detail.code, detail.species, payout.kg, detail.grade ?? "", payout.gross, payout.deduction, payout.net];
  });
  return [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
}

function downloadText(fileName: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function FisherView() {
  const db = useDemoDatabase();
  const now = useDemoNow();
  const repository = useRepository();
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [shownHistory, setShownHistory] = useState(HISTORY_PAGE);

  const fisher = db.fishers.find((candidate) => candidate.id === DEMO_FISHER_ID)!;
  const debt = debtSummary(db, fisher.id);
  const awaiting = installmentAwaitingPayment(db, fisher.id);
  const payouts = payoutsFor(db, fisher.id);
  const latest = payouts[0];
  const latestCatch = latest ? payoutCatch(db, latest, now) : null;
  const todays = landingsOnDate(db, localDateOf(now)).filter((view) => view.fisher.id === fisher.id);

  const decide = async (approve: boolean) => {
    if (!awaiting) {
      return;
    }
    setBusy(true);
    setFailure(null);
    try {
      await repository.decideDeduction({ entryId: awaiting.id, approve, via: "link" });
    } catch {
      setFailure("Keputusan belum tersimpan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <RoleHeader title={`Pak ${fisher.name}`} subtitle={db.kub.name} initials={fisher.initials} currentRole="Nelayan" />
      <main className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 pb-12 pt-5 sm:px-6">
        {failure && <Notice tone="danger" title={failure} />}
        {awaiting && (
          <DeductionDecision
            key={awaiting.id}
            entry={awaiting}
            lender={debt.lenders.find((lender) => lender.lender === awaiting.counterparty)}
            busy={busy}
            onDecide={(approve) => void decide(approve)}
          />
        )}

        {todays.map((view) => {
          const outcome = landingOutcome(db, view.landing.id, now);
          return (
            <Card key={view.landing.id} className="flex flex-col gap-2 p-5">
              <p className="text-ink-2">Hari ini · darat {formatClock(view.landing.landedAt)}</p>
              <div className="flex items-center gap-3">
                {view.grading ? <GradeStamp grade={view.grading.grade} size="md" /> : <Pill tone="warning">Belum dinilai</Pill>}
                <p className="type-h3">
                  {formatKg(view.landing.weightKg)} {view.species.name.toLowerCase()}
                  {view.grading ? ` · ${GRADE_SPOKEN[view.grading.grade]}` : ""}
                </p>
              </div>
              {outcome && outcome.payoutEstimate > 0 && (
                <p className="leading-snug text-ink-2">
                  Perkiraan <b className="text-ink">{formatRupiah(outcome.payoutEstimate)}</b>
                  {outcome.destination === "batch" ? ", dibayar setelah pembeli menerima ikan." : "."}
                </p>
              )}
              {!view.grading && <p className="text-ink-2">Operator KUB sedang menilai ikannya.</p>}
            </Card>
          );
        })}

        {latest && (
          <Card className="flex flex-col gap-2 p-5">
            <p className="text-ink-2">Uang terakhir · {formatShortDayDate(latest.date)}</p>
            <p className="type-figure-stat">{formatRupiah(latest.net)}</p>
            <p className="flex items-center gap-2 text-ink-2">
              {latestCatch?.grade && <GradeStamp grade={latestCatch.grade} size="sm" />}
              {formatKg(latest.kg)} {latestCatch?.species}
              {latest.deduction > 0 ? ` · cicilan ${formatRupiah(latest.deduction)}` : ""}
            </p>
          </Card>
        )}

        {debt.lenders.map((lender) => (
          <Card key={lender.lender} className="flex flex-col gap-3 p-5">
            <p className="text-ink-2">Sisa pinjaman ke {lender.lender}</p>
            <p className="type-figure-stat">{formatRupiah(lender.outstanding)}</p>
            <FillMeter
              filled={lender.repaid}
              target={lender.principal}
              label={`Sudah dibayar ${formatRupiah(lender.repaid)} dari ${formatRupiah(lender.principal)}`}
            />
            <p className="text-ink-2">
              Sudah dibayar {formatRupiah(lender.repaid)} dari {formatRupiah(lender.principal)}
            </p>
          </Card>
        ))}

        <section aria-labelledby="riwayat" className="flex flex-col gap-2">
          <h2 id="riwayat" className="type-h3">
            Riwayat uang
          </h2>
          <Card className="px-4 py-1 sm:px-5">
            {payouts.length === 0 ? (
              <p className="py-4 text-ink-2">Belum ada uang dari pesanan.</p>
            ) : (
              <ul>
                {payouts.slice(0, shownHistory).map((payout) => {
                  const detail = payoutCatch(db, payout, now);
                  return (
                    <li key={payout.batchId} className="flex min-h-16 items-center gap-3 border-b border-line py-2.5 last:border-b-0">
                      {detail.grade && <GradeStamp grade={detail.grade} size="sm" />}
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="font-bold">
                          {formatKg(payout.kg)} {detail.species}
                        </span>
                        <span className="text-ink-2">
                          {formatShortDayDate(payout.date)}
                          {payout.deduction > 0 ? ` · cicilan ${formatRupiah(payout.deduction)}` : ""}
                        </span>
                      </div>
                      <span className="tabular shrink-0 text-lg font-extrabold">{formatRupiah(payout.net)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
          {payouts.length > shownHistory && (
            <Button variant="quiet" size="md" block onClick={() => setShownHistory((count) => count + HISTORY_PAGE)}>
              Lihat sebelumnya ({payouts.length - shownHistory})
            </Button>
          )}
          {payouts.length > 0 && (
            <Button
              variant="ghost"
              size="md"
              icon="download"
              className="self-start"
              onClick={() => downloadText(`riwayat-pak-${fisher.name.toLowerCase()}.csv`, historyCsv(db, payouts, now))}
            >
              Unduh riwayat untuk ajukan kredit
            </Button>
          )}
          <p className="flex items-start gap-2 text-[0.9375rem] leading-snug text-ink-2">
            <Icon name="shield" size={18} className="mt-0.5 shrink-0" />
            Hanya Bapak dan operator KUB yang bisa melihat halaman ini.
          </p>
        </section>
      </main>
    </>
  );
}
