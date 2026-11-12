"use client";

import { RolePage } from "@/components/layout/role-shell";
import { LandingRow } from "@/components/operator/landing-row";
import { OperatorTopBar } from "@/components/operator/operator-shell";
import { ButtonLink } from "@/components/ui/button";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { Avatar, Card, LedgerRow, Notice, SourceNote } from "@/components/ui/surface";
import { GRADE_LABEL } from "@/content/labels";
import { useDemoDatabase, useDemoNow } from "@/data/demo-data-provider";
import { MEMBER_WINDOW_DAYS, memberProfile } from "@/data/queries/operator-pages";
import { formatDecimal, formatKg, formatRupiah, formatShortDayDate } from "@/lib/format";

const LANDINGS_SHOWN = 8;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="flex flex-col-reverse gap-1 px-4 py-3.5">
      <dt className="text-sm text-ink-2">{label}</dt>
      <dd className="type-money min-w-0 break-words text-lg sm:text-[1.625rem]">{value}</dd>
    </Card>
  );
}

export function MemberProfileView({ fisherId }: { fisherId: string }) {
  const db = useDemoDatabase();
  const now = useDemoNow();
  const profile = memberProfile(db, fisherId, now);

  if (!profile) {
    return (
      <>
        <OperatorTopBar title="Anggota tidak ditemukan" back={{ href: "/kub/anggota", label: "Kembali ke daftar anggota" }} />
        <RolePage>
          <Notice tone="warning" title="Anggota ini tidak ada di catatan">
            Kembali ke daftar anggota dan pilih lagi.
          </Notice>
          <ButtonLink href="/kub/anggota" variant="secondary" size="lg" icon="people">
            Daftar anggota
          </ButtonLink>
        </RolePage>
      </>
    );
  }

  const { summary, landings, gradeShares, payouts, ledger, debt } = profile;
  const { fisher } = summary;
  const species = db.species.find((entry) => entry.id === fisher.usualSpeciesId);
  const totalGradedKg = gradeShares.reduce((sum, share) => sum + share.kg, 0);
  const loans = ledger.filter((entry) => entry.kind !== "income");

  return (
    <>
      <OperatorTopBar
        title={`Pak ${fisher.name}`}
        subtitle={`Anggota #${fisher.memberNumber} · ${db.kub.name}`}
        back={{ href: "/kub/anggota", label: "Kembali ke daftar anggota" }}
      />
      <RolePage>
        <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between" aria-label="Ringkasan anggota">
          <div className="flex items-center gap-4">
            <Avatar initials={fisher.initials} size="lg" />
            <p className="text-ink-2">
              Perahu <span className="tabular font-semibold text-ink">{fisher.boatGrossTonnage}</span> GT · biasa membawa{" "}
              {species?.name.toLowerCase()}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <ButtonLink href="/kub/darat" size="lg" icon="scale">
              Catat pendaratan
            </ButtonLink>
            <ButtonLink href="/kub/bayar" variant="secondary" size="lg" icon="ledger">
              Buku kas
            </ButtonLink>
          </div>
        </section>

        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          <Stat label={`kg ${MEMBER_WINDOW_DAYS} hari`} value={formatKg(summary.kg)} />
          <Stat label={`pendapatan ${MEMBER_WINDOW_DAYS} hari`} value={formatRupiah(summary.income)} />
          <Stat label="pendaratan" value={String(summary.landingCount)} />
          <Stat label="sisa pinjaman" value={debt.outstanding > 0 ? formatRupiah(debt.outstanding) : "Tidak ada"} />
        </dl>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            <section aria-labelledby="riwayat-pendaratan" className="panel px-5 pb-2 pt-5">
              <div className="flex items-baseline justify-between gap-3 pb-1">
                <h2 id="riwayat-pendaratan" className="type-h2">
                  Riwayat pendaratan
                </h2>
                <span className="record-number">{landings.length} catatan</span>
              </div>
              {landings.length === 0 ? (
                <p className="py-5 text-ink-2">Belum ada pendaratan. Catat pendaratan pertama Pak {fisher.name} dari tombol di atas.</p>
              ) : (
                <ul>
                  {landings.slice(0, LANDINGS_SHOWN).map((view) => (
                    <LandingRow key={view.landing.id} view={view} showDate showFisher={false} />
                  ))}
                </ul>
              )}
              {landings.length > LANDINGS_SHOWN && (
                <p className="py-3 text-sm text-ink-2">
                  Menampilkan {LANDINGS_SHOWN} terbaru dari {landings.length} pendaratan.
                </p>
              )}
            </section>

            <section aria-labelledby="sebaran-mutu" className="panel flex flex-col gap-4 p-5">
              <h2 id="sebaran-mutu" className="type-h2">
                Sebaran mutu
              </h2>
              {gradeShares.length === 0 ? (
                <p className="text-ink-2">Belum ada hasil penilaian.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {gradeShares.map((share) => {
                    const percent = totalGradedKg > 0 ? (share.kg / totalGradedKg) * 100 : 0;
                    return (
                      <li key={share.grade} className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-3">
                        <GradeStamp grade={share.grade} size="sm" />
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="font-medium">{GRADE_LABEL[share.grade]}</span>
                            <span className="tabular text-ink-2">
                              {formatDecimal(share.kg)} kg · {share.count} kali
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-sky-tint" aria-hidden>
                            <span className="block h-full rounded-full bg-sea" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          <div className="flex flex-col gap-6">
            <section aria-labelledby="bagi-hasil-anggota" className="panel flex flex-col gap-3 p-5">
              <h2 id="bagi-hasil-anggota" className="type-h2">
                Bagi hasil diterima
              </h2>
              {payouts.length === 0 ? (
                <p className="text-ink-2">Belum ada bagi hasil. Muncul setelah pembeli menerima kiriman yang memuat ikan Pak {fisher.name}.</p>
              ) : (
                <ul className="flex flex-col">
                  {payouts.slice(0, 6).map((payout) => (
                    <li key={payout.batchId} className="flex flex-col gap-1 border-t border-line py-3 first:border-t-0">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-semibold">{formatShortDayDate(payout.date)}</span>
                        <span className="tabular font-semibold">{formatRupiah(payout.net)}</span>
                      </div>
                      <LedgerRow muted label={`${formatDecimal(payout.kg)} kg, sebelum potongan`} value={formatRupiah(payout.gross)} />
                      {payout.deduction > 0 && <LedgerRow muted label="Cicilan dipotong" value={`− ${formatRupiah(payout.deduction)}`} />}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="pinjaman-anggota" className="panel flex flex-col gap-3 p-5">
              <h2 id="pinjaman-anggota" className="type-h2">
                Pinjaman & cicilan
              </h2>
              {debt.principal === 0 ? (
                <p className="text-ink-2">Pak {fisher.name} tidak punya pinjaman tercatat.</p>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <LedgerRow label="Pinjaman awal" value={formatRupiah(debt.principal)} />
                    <LedgerRow label="Sudah dicicil" value={formatRupiah(debt.repaid)} />
                    <LedgerRow strong label="Sisa" value={formatRupiah(debt.outstanding)} />
                  </div>
                  {debt.pending.length > 0 && (
                    <Notice tone="warning" icon="hand" title="Ada cicilan menunggu persetujuan">
                      Jawabannya dicatat di Bayar & buku kas.
                    </Notice>
                  )}
                  <ul className="flex flex-col">
                    {loans.slice(0, 6).map((entry) => (
                      <li key={entry.id} className="flex items-baseline justify-between gap-3 border-t border-line py-2.5">
                        <span className="flex min-w-0 flex-col leading-snug">
                          <span className="font-medium">{entry.note}</span>
                          <span className="text-sm text-ink-2">
                            {formatShortDayDate(entry.date)} · {entry.counterparty}
                          </span>
                        </span>
                        <span className="tabular shrink-0 font-semibold">
                          {entry.kind === "loan" ? "" : "− "}
                          {formatRupiah(entry.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <ButtonLink href="/kub/bayar" variant="secondary" size="md" icon="ledger" iconAfter="chevronRight">
                Buka buku kas
              </ButtonLink>
            </section>
          </div>
        </div>
        <SourceNote simulated>Angka dihitung dari catatan demo di perangkat ini.</SourceNote>
      </RolePage>
    </>
  );
}
