"use client";

import { RolePage } from "@/components/layout/role-shell";
import { FisherTopBar } from "@/components/shells/role-shells";
import { ButtonLink } from "@/components/ui/button";
import { FillMeter } from "@/components/ui/meters";
import { Card, Notice, Pill, SourceNote } from "@/components/ui/surface";
import { decisionHistory, lenderBooks, type LenderBook } from "@/data/queries/fisher-pages";
import { debtSummary } from "@/data/queries/fishers";
import { formatClock, formatRupiah, formatShortDate, formatShortDayDate } from "@/lib/format";
import { approvalLabel, useFisher } from "./fisher-shared";

const KIND_LABEL = {
  loan: "Pinjaman",
  installment: "Cicilan",
  income: "Pemasukan",
} as const;

function LenderCard({ book }: { book: LenderBook }) {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-1">
        <h2 className="type-h3">{book.lender}</h2>
        <p className="text-ink-2">Sisa pinjaman</p>
        <p className="type-figure-stat">{formatRupiah(book.outstanding)}</p>
      </div>
      <FillMeter
        filled={book.repaid}
        target={book.principal}
        label={`Sudah dibayar ${formatRupiah(book.repaid)} dari ${formatRupiah(book.principal)}`}
      />
      <p className="text-ink-2">
        Sudah dibayar {formatRupiah(book.repaid)} dari {formatRupiah(book.principal)}
      </p>

      {book.installmentsLeft !== null && book.averageInstallment !== null ? (
        <Notice
          tone="neutral"
          icon="calendar"
          title={`Perkiraan lunas dalam ${book.installmentsLeft} kali cicilan lagi`}
        >
          Dihitung dari rata-rata cicilan yang sudah disetujui, {formatRupiah(book.averageInstallment)}. Ini hanya
          perkiraan, bukan janji.
        </Notice>
      ) : (
        book.outstanding > 0 && (
          <p className="leading-snug text-ink-2">Perkiraan lunas muncul setelah ada cicilan yang disetujui.</p>
        )
      )}

      <ul className="md:hidden">
        {book.lines.map(({ entry, counted, balance }) => {
          const state = approvalLabel(entry);
          return (
            <li key={entry.id} className="flex flex-col gap-1 border-b border-line py-3 last:border-b-0">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-semibold">
                  {KIND_LABEL[entry.kind]} · {formatShortDate(entry.date)}
                </span>
                <span className="tabular shrink-0 font-semibold">
                  {entry.kind === "installment" ? "−" : ""}
                  {formatRupiah(entry.amount)}
                </span>
              </div>
              <p className="text-[0.9375rem] text-ink-2">{entry.note}</p>
              <div className="flex items-center justify-between gap-3">
                <Pill tone={state.tone}>{counted && entry.kind === "installment" ? "Dipotong" : state.label}</Pill>
                <span className="tabular text-ink-2">Saldo {formatRupiah(balance)}</span>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[34rem] border-collapse text-left">
          <caption className="sr-only">Buku kas {book.lender}</caption>
          <thead>
            <tr className="border-b border-line text-ink-2">
              <th scope="col" className="py-2 pr-3 font-semibold">
                Tanggal
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                Jenis
              </th>
              <th scope="col" className="py-2 pr-3 text-right font-semibold">
                Jumlah
              </th>
              <th scope="col" className="py-2 pr-3 font-semibold">
                Persetujuan
              </th>
              <th scope="col" className="py-2 text-right font-semibold">
                Saldo
              </th>
            </tr>
          </thead>
          <tbody>
            {book.lines.map(({ entry, counted, balance }) => {
              const state = approvalLabel(entry);
              return (
                <tr key={entry.id} className="border-b border-line last:border-b-0">
                  <td className="py-3 pr-3 align-top whitespace-nowrap">{formatShortDate(entry.date)}</td>
                  <td className="py-3 pr-3 align-top">
                    {KIND_LABEL[entry.kind]}
                    <span className="block text-[0.9375rem] text-ink-2">{entry.note}</span>
                  </td>
                  <td className="tabular py-3 pr-3 text-right align-top whitespace-nowrap">
                    {entry.kind === "installment" ? "−" : ""}
                    {formatRupiah(entry.amount)}
                  </td>
                  <td className="py-3 pr-3 align-top">
                    <Pill tone={state.tone}>{counted && entry.kind === "installment" ? "Dipotong" : state.label}</Pill>
                  </td>
                  <td className="tabular py-3 text-right align-top font-semibold whitespace-nowrap">
                    {formatRupiah(balance)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[0.9375rem] leading-snug text-ink-2">
        Cicilan yang disetujui tapi uang pesanannya belum dibayar pembeli belum mengurangi saldo.
      </p>
    </Card>
  );
}

export function FisherLoans() {
  const { db, fisher } = useFisher();
  const books = lenderBooks(db, fisher.id);
  const history = decisionHistory(db, fisher.id);
  const debt = debtSummary(db, fisher.id);

  return (
    <>
      <FisherTopBar title="Pinjaman" subtitle="Buku kas, dicatat terbuka" />
      <RolePage>
        {debt.pending.length > 0 && (
          <Notice
            tone="warning"
            title="Ada cicilan yang menunggu jawaban Bapak"
            action={
              <ButtonLink href="/nelayan" size="md" variant="secondary">
                Jawab
              </ButtonLink>
            }
          />
        )}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
          <div className="flex flex-col gap-4">
            {books.length === 0 ? (
              <Card tone="paper" className="p-5 text-ink-2">
                Tidak ada catatan pinjaman. Kalau Bapak punya pinjaman, operator KUB mencatatnya di sini supaya terbuka.
              </Card>
            ) : (
              books.map((book) => <LenderCard key={book.lender} book={book} />)
            )}
            <SourceNote>
              Nelayanku tidak meminjamkan uang. Buku kas hanya mencatat pinjaman yang sudah ada. Data di demo ini
              fiktif.
            </SourceNote>
          </div>

          <section aria-labelledby="keputusan" className="flex flex-col gap-2">
            <h2 id="keputusan" className="type-h3">
              Keputusan cicilan Bapak
            </h2>
            <Card className="px-4">
              {history.length === 0 ? (
                <p className="py-4 text-ink-2">Belum ada permintaan cicilan.</p>
              ) : (
                <ul>
                  {history.map(({ entry, decidedAt }) => {
                    const state = approvalLabel(entry);
                    return (
                      <li key={entry.id} className="flex flex-col gap-1.5 border-b border-line py-3.5 last:border-b-0">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="font-semibold">{entry.counterparty}</span>
                          <span className="tabular font-semibold">{formatRupiah(entry.amount)}</span>
                        </div>
                        <p className="text-ink-2">
                          Diminta {formatShortDayDate(entry.date)}
                          {decidedAt
                            ? ` · dijawab ${formatShortDayDate(decidedAt)}, ${formatClock(decidedAt)}`
                            : entry.approval === "pending"
                              ? ""
                              : " · waktu jawaban tidak tercatat"}
                        </p>
                        <Pill tone={state.tone} className="self-start">
                          {state.label}
                        </Pill>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </section>
        </div>
      </RolePage>
    </>
  );
}
