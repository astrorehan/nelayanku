"use client";

import { useState } from "react";
import { OperatorTopBar } from "@/components/operator/operator-shell";
import { BatchPayoutCard } from "@/components/payments/batch-payout-card";
import { DebtCard, VerbalAnswerSheet } from "@/components/payments/debt-card";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/choices";
import { Card, Notice, SourceNote } from "@/components/ui/surface";
import { useDemoDatabase, useDemoNow, useRepository } from "@/data/demo-data-provider";
import { batchPayouts, fishersWithDebt, ledgerFor } from "@/data/queries/fishers";
import type { LedgerEntry } from "@/data/types";

type PaymentsTab = "bagi-hasil" | "buku-kas";

const PAYOUTS_PER_PAGE = 4;

export function PaymentsView() {
  const db = useDemoDatabase();
  const now = useDemoNow();
  const repository = useRepository();
  const [tab, setTab] = useState<PaymentsTab>("bagi-hasil");
  const [shownPayouts, setShownPayouts] = useState(PAYOUTS_PER_PAGE);
  const [answering, setAnswering] = useState<LedgerEntry | null>(null);
  const [answerSheetKey, setAnswerSheetKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const payouts = batchPayouts(db, now);
  const debts = fishersWithDebt(db);
  const inTransitCount = db.batches.filter((batch) => batch.status === "in_transit").length;
  const answeringFisher = answering ? (db.fishers.find((fisher) => fisher.id === answering.fisherId) ?? null) : null;

  const saveAnswer = async (approve: boolean) => {
    if (!answering) {
      return;
    }
    setBusy(true);
    setFailure(null);
    try {
      await repository.decideDeduction({ entryId: answering.id, approve, via: "verbal" });
      setAnswering(null);
    } catch {
      setFailure("Jawaban belum tersimpan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <OperatorTopBar title="Bayar & buku kas" subtitle={<span className="lg:hidden">{db.kub.name}</span>} />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 pb-8 pt-4 sm:px-6 lg:px-10 lg:pt-0">
        <Segmented
          label="Bagian"
          value={tab}
          onChange={setTab}
          className="lg:hidden"
          options={[
            { value: "bagi-hasil", title: "Bagi hasil" },
            { value: "buku-kas", title: "Buku kas" },
          ]}
        />
        {failure && <Notice tone="danger" title={failure} />}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
          <section aria-labelledby="bagi-hasil" className={tab === "bagi-hasil" ? "flex flex-col gap-4" : "hidden flex-col gap-4 lg:flex"}>
            <div className="flex flex-col gap-1">
              <h2 id="bagi-hasil" className="type-h2">
                Bagi hasil
              </h2>
              <SourceNote simulated>Dari kiriman yang sudah diterima pembeli. Pembayaran di demo ini simulasi.</SourceNote>
            </div>
            {inTransitCount > 0 && (
              <Notice tone="info" icon="courier" title={`${inTransitCount} kiriman dalam perjalanan`}>
                Bagi hasilnya dihitung setelah pembeli menerima dan memeriksa ulang.
              </Notice>
            )}
            {payouts.length === 0 ? (
              <Card tone="paper" className="p-5 text-ink-2">
                Belum ada kiriman yang diterima.
              </Card>
            ) : (
              payouts.slice(0, shownPayouts).map((payout) => (
                <BatchPayoutCard key={payout.view.batch.id} payout={payout} fishers={db.fishers} kubName={db.kub.name} />
              ))
            )}
            {payouts.length > shownPayouts && (
              <Button variant="quiet" size="md" block onClick={() => setShownPayouts((count) => count + PAYOUTS_PER_PAGE)}>
                Lihat kiriman sebelumnya ({payouts.length - shownPayouts})
              </Button>
            )}
          </section>

          <section aria-labelledby="buku-kas" className={tab === "buku-kas" ? "flex flex-col gap-4" : "hidden flex-col gap-4 lg:flex"}>
            <div className="flex flex-col gap-1">
              <h2 id="buku-kas" className="type-h2">
                Buku kas
              </h2>
              <p className="text-ink-2">Utang yang sudah ada, dicatat terbuka. Cicilan hanya dipotong kalau nelayan setuju.</p>
            </div>
            {debts.length === 0 ? (
              <Card tone="paper" className="p-5 text-ink-2">
                Tidak ada catatan utang.
              </Card>
            ) : (
              debts.map((debt) => (
                <DebtCard
                  key={debt.fisher.id}
                  debt={debt}
                  history={ledgerFor(db, debt.fisher.id).filter((entry) => entry.kind !== "income")}
                  onAnswerVerbally={(entry) => {
                    setAnswerSheetKey((key) => key + 1);
                    setAnswering(entry);
                  }}
                />
              ))
            )}
            <p className="text-[0.9375rem] leading-snug text-ink-2">
              Nelayanku tidak meminjamkan uang. Buku kas hanya mencatat utang yang sudah ada agar potongannya terbuka.
            </p>
          </section>
        </div>
      </main>
      <VerbalAnswerSheet
        key={answerSheetKey}
        open={answering !== null}
        onOpenChange={(open) => !open && setAnswering(null)}
        fisher={answeringFisher}
        entry={answering}
        busy={busy}
        onSave={saveAnswer}
      />
    </>
  );
}
