"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icons/icon";
import { RolePage } from "@/components/layout/role-shell";
import { FisherTopBar } from "@/components/shells/role-shells";
import { Button } from "@/components/ui/button";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { Card, LedgerRow, Notice } from "@/components/ui/surface";
import { useDemoNow } from "@/data/demo-data-provider";
import { localDateOf } from "@/data/demo-clock";
import { batchView } from "@/data/queries/batches";
import { payoutsByMonth } from "@/data/queries/fisher-pages";
import { debtSummary, payoutsFor, type Payout } from "@/data/queries/fishers";
import type { DemoDatabase } from "@/data/types";
import { formatKg, formatRupiah, formatShortDayDate } from "@/lib/format";
import { documentTable, escapeHtml, printDocument } from "@/lib/print-document";
import { useFisher } from "./fisher-shared";

const MONTH_NAME = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const monthTitle = (month: string) => MONTH_NAME.format(new Date(`${month}-01T00:00:00Z`));

function payoutCatch(db: DemoDatabase, payout: Payout, now: Date) {
  const view = batchView(db, payout.batchId, now);
  return {
    grade: view?.batchGrade ?? view?.order.minimumGrade ?? null,
    species: view?.species.name.toLowerCase() ?? "ikan",
    code: view?.batch.code ?? "",
  };
}

function historyCsv(db: DemoDatabase, payouts: Payout[], now: Date): string {
  const header = [
    "Tanggal",
    "Kode kiriman",
    "Ikan",
    "Berat (kg)",
    "Mutu",
    "Kotor (Rp)",
    "Potongan (Rp)",
    "Bersih (Rp)",
  ];
  const rows = payouts.map((payout) => {
    const detail = payoutCatch(db, payout, now);
    return [
      localDateOf(payout.date),
      detail.code,
      detail.species,
      payout.kg,
      detail.grade ?? "",
      payout.gross,
      payout.deduction,
      payout.net,
    ];
  });
  return [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
}

function downloadText(fileName: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function FisherMoney() {
  const { db, fisher } = useFisher();
  const now = useDemoNow();
  const [failure, setFailure] = useState<string | null>(null);
  const months = payoutsByMonth(db, fisher.id);
  const payouts = payoutsFor(db, fisher.id);
  const debt = debtSummary(db, fisher.id);
  const totalNet = payouts.reduce((sum, payout) => sum + payout.net, 0);
  const totalDeduction = payouts.reduce((sum, payout) => sum + payout.deduction, 0);

  const print = async () => {
    try {
      const rows = payouts.map((payout) => {
        const detail = payoutCatch(db, payout, now);
        return [
          formatShortDayDate(payout.date),
          detail.code,
          formatKg(payout.kg),
          formatRupiah(payout.gross),
          formatRupiah(payout.deduction),
          formatRupiah(payout.net),
        ];
      });
      await printDocument(
        `Riwayat uang Pak ${fisher.name}`,
        `<p>${escapeHtml(db.kub.name)}</p>${documentTable(["Tanggal", "Kiriman", "Berat", "Kotor", "Cicilan", "Diterima"], rows)}<h2>Sisa pinjaman</h2>${documentTable(
          ["Pemberi pinjaman", "Sisa"],
          debt.lenders.map((lender) => [lender.lender, formatRupiah(lender.outstanding)]),
        )}<p>Hanya potongan yang disetujui dan pembayaran yang lunas yang masuk riwayat. Semua angka merupakan simulasi.</p>`,
      );
    } catch {
      setFailure("Riwayat belum bisa dibuka. Coba lagi.");
    }
  };

  return (
    <>
      <FisherTopBar title="Uang masuk" subtitle="Dari kiriman yang sudah diterima pembeli" />
      <RolePage>
        {failure && <Notice tone="danger" title={failure} />}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start">
          <div className="flex flex-col gap-6">
            {months.length === 0 && (
              <Card tone="paper" className="p-5 text-ink-2">
                Belum ada uang dari pesanan. Setelah pembeli menerima kiriman Bapak, hasilnya muncul di sini.
              </Card>
            )}
            {months.map((month) => (
              <section key={month.month} aria-labelledby={`bulan-${month.month}`} className="flex flex-col gap-2">
                <h2
                  id={`bulan-${month.month}`}
                  className="flex flex-wrap items-baseline justify-between gap-x-3 type-h3"
                >
                  <span className="capitalize">{monthTitle(month.month)}</span>
                  <span className="tabular text-base font-normal text-ink-2">
                    {formatRupiah(month.net)} · {formatKg(month.kg)}
                  </span>
                </h2>
                <Card className="px-4">
                  <ul>
                    {month.payouts.map((payout) => {
                      const detail = payoutCatch(db, payout, now);
                      return (
                        <li key={payout.batchId} className="border-b border-line last:border-b-0">
                          <Link
                            href={`/nelayan/uang/${payout.batchId}`}
                            className="flex min-h-[4.5rem] items-center gap-3 py-3 hover:bg-paper"
                          >
                            {detail.grade && <GradeStamp grade={detail.grade} size="sm" />}
                            <span className="flex min-w-0 flex-1 flex-col">
                              <span className="font-semibold">
                                {formatKg(payout.kg)} {detail.species}
                              </span>
                              <span className="text-ink-2">
                                {formatShortDayDate(payout.date)}
                                {payout.deduction > 0 ? ` · cicilan ${formatRupiah(payout.deduction)}` : ""}
                              </span>
                            </span>
                            <span className="tabular shrink-0 text-lg font-semibold">{formatRupiah(payout.net)}</span>
                            <Icon name="chevronRight" size={20} className="shrink-0 text-ink-3" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              </section>
            ))}
          </div>

          <aside className="flex flex-col gap-3 lg:sticky lg:top-6">
            <Card className="flex flex-col gap-3 p-5">
              <h2 className="type-h3">Seluruh riwayat</h2>
              <LedgerRow label="Uang diterima" value={formatRupiah(totalNet)} strong />
              <LedgerRow label="Sudah dipotong cicilan" value={formatRupiah(totalDeduction)} muted />
              <LedgerRow label="Jumlah kiriman" value={payouts.length} muted />
            </Card>
            {payouts.length > 0 && (
              <div className="flex flex-col items-start gap-1">
                <Button variant="quiet" size="md" icon="printer" onClick={() => void print()}>
                  Cetak riwayat / simpan PDF
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  icon="download"
                  onClick={() =>
                    downloadText(`riwayat-pak-${fisher.name.toLowerCase()}.csv`, historyCsv(db, payouts, now))
                  }
                >
                  Unduh riwayat CSV
                </Button>
              </div>
            )}
            <p className="flex items-start gap-2 text-[0.9375rem] leading-snug text-ink-2">
              <Icon name="shield" size={18} className="mt-0.5 shrink-0" />
              Di aplikasi nyata, buku kas hanya untuk Bapak dan operator KUB. Demo ini memakai data fiktif dan bisa
              dibuka tanpa akun.
            </p>
          </aside>
        </div>
      </RolePage>
    </>
  );
}
