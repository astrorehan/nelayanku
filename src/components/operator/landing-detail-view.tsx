"use client";

import Link from "next/link";
import { RolePage } from "@/components/layout/role-shell";
import { OperatorTopBar } from "@/components/operator/operator-shell";
import { ButtonLink } from "@/components/ui/button";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { Card, LedgerRow, Notice, Pill, SourceNote, type PillTone } from "@/components/ui/surface";
import { GRADE_LABEL, GRADE_MEANING, ODOR_LABEL, TEXTURE_LABEL } from "@/content/labels";
import { useDemoDatabase, useDemoNow } from "@/data/demo-data-provider";
import { localDateOf } from "@/data/demo-clock";
import { landingDetail } from "@/data/queries/operator-pages";
import type { LandingDestination } from "@/data/types";
import type { FreshClockStatus } from "@/domain/cold-chain";
import { formatClock, formatDecimal, formatDuration, formatFullDate, formatKg, formatRupiah, formatScore } from "@/lib/format";

const DESTINATION_LABEL: Record<LandingDestination, string> = {
  batch: "Pesanan pembeli",
  port_auction: "Dijual di TPI",
  processing: "Bahan olahan UMKM",
  not_for_consumption: "Bukan untuk dimakan",
};

const FRESH_PILL: Record<FreshClockStatus, { label: string; tone: PillTone }> = {
  safe: { label: "Masih segar", tone: "success" },
  soon: { label: "Segera dikirim", tone: "warning" },
  expired: { label: "Batas segar lewat", tone: "danger" },
};

const SOURCE_LABEL = { model: "dinilai model", person: "dinilai petugas" } as const;

export function LandingDetailView({ landingId }: { landingId: string }) {
  const db = useDemoDatabase();
  const now = useDemoNow();
  const detail = landingDetail(db, landingId, now);
  const back = { href: "/kub", label: "Kembali ke beranda" };

  if (!detail) {
    return (
      <>
        <OperatorTopBar title="Pendaratan tidak ditemukan" back={back} />
        <RolePage>
          <Notice tone="warning" title="Catatan pendaratan ini tidak ada">
            Buka lagi dari daftar pendaratan di beranda atau dari profil anggota.
          </Notice>
          <ButtonLink href="/kub" variant="secondary" size="lg" icon="home">
            Ke beranda
          </ButtonLink>
        </RolePage>
      </>
    );
  }

  const { view, batch, material } = detail;
  const grading = view.grading;
  const { landing, fisher, species } = view;
  const destination = landing.destination;
  const pending = grading === null && destination === null;
  const parameters = grading
    ? [
        { key: "eye", label: "Mata", score: grading.parameters.eye, note: SOURCE_LABEL[grading.eyeSource] },
        { key: "gill", label: "Insang", score: grading.parameters.gill, note: SOURCE_LABEL[grading.gillSource] },
        { key: "odor", label: "Bau", score: grading.parameters.odor, note: ODOR_LABEL[grading.odor].title },
        { key: "texture", label: "Tekstur", score: grading.parameters.texture, note: TEXTURE_LABEL[grading.texture].title },
      ]
    : [];
  const overridden = grading !== null && grading.grade !== grading.modelGrade;
  const fresh = FRESH_PILL[detail.freshStatus];
  const finished = localDateOf(landing.landedAt) < localDateOf(now);

  return (
    <>
      <OperatorTopBar
        title={`${species.name} Pak ${fisher.name}`}
        subtitle={`${formatFullDate(landing.landedAt)}, pukul ${formatClock(landing.landedAt)}`}
        back={back}
      />
      <RolePage>
        <section className="flex flex-wrap items-center gap-4" aria-label="Ringkasan pendaratan">
          {grading ? (
            <GradeStamp grade={grading.grade} size="lg" />
          ) : (
            <Pill tone="warning">Belum dinilai</Pill>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="type-money text-[2rem] leading-none">
              {formatDecimal(landing.weightKg)}
              <span className="ml-1.5 font-[family-name:var(--font-sans)] text-lg font-normal text-ink-2">kg</span>
            </p>
            {grading && (
              <p className="text-ink-2">
                Mutu {GRADE_LABEL[grading.grade]}. {GRADE_MEANING[grading.grade]}.
              </p>
            )}
          </div>
          {pending && (
            <ButtonLink href={`/kub/darat?pendaratan=${landing.id}`} size="lg" icon="scale">
              Nilai sekarang
            </ButtonLink>
          )}
        </section>

        {pending && (
          <Notice tone="warning" title="Ikan ini belum dinilai">
            Selesaikan penilaian supaya ikan bisa diarahkan ke pesanan, TPI, atau bahan olahan.
          </Notice>
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <section aria-labelledby="hasil-penilaian" className="panel flex flex-col gap-4 p-5">
              <h2 id="hasil-penilaian" className="type-h2">
                Hasil penilaian
              </h2>
              {grading ? (
                <>
                  <ul className="flex flex-col">
                    {parameters.map((parameter) => (
                      <li key={parameter.key} className="flex items-baseline justify-between gap-3 border-t border-line py-3 first:border-t-0 first:pt-0">
                        <span className="flex flex-col leading-snug">
                          <span className="font-semibold">{parameter.label}</span>
                          <span className="text-sm text-ink-2">{parameter.note}</span>
                        </span>
                        <span className="type-money text-xl">
                          {formatScore(parameter.score)}
                          <span className="ml-1 text-sm font-normal text-ink-3">/ 9</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col gap-1 border-t border-line pt-3">
                    <LedgerRow strong label="Nilai akhir" value={`${formatScore(grading.finalScore)} / 9`} />
                    <LedgerRow muted label="Mutu usulan model" value={`${grading.modelGrade} (${GRADE_LABEL[grading.modelGrade]})`} />
                    <LedgerRow strong label="Mutu ditetapkan" value={`${grading.grade} (${GRADE_LABEL[grading.grade]})`} />
                  </div>
                  {overridden ? (
                    <Notice tone="info" icon="edit" title="Mutu diubah oleh petugas">
                      {grading.overrideReason ?? "Alasan tidak dicatat."}
                    </Notice>
                  ) : (
                    <SourceNote>Mutu sama dengan usulan hasil hitung. Tidak ada perubahan manual.</SourceNote>
                  )}
                </>
              ) : (
                <p className="text-ink-2">Belum ada hasil. Penilaian memakai mata, insang, bau, dan tekstur ikan.</p>
              )}
              <SourceNote>
                Foto mata dan insang hanya dipakai saat penilaian dan tidak disimpan di catatan demo ini.
              </SourceNote>
            </section>

            {grading && (
              <section aria-labelledby="jejak-audit" className="panel flex flex-col gap-3 p-5">
                <h2 id="jejak-audit" className="type-h2">
                  Jejak catatan
                </h2>
                <LedgerRow muted label="Dinilai" value={`${formatFullDate(grading.gradedAt)}, ${formatClock(grading.gradedAt)}`} />
                <LedgerRow muted label="Versi model" value={grading.modelVersion} />
                <div className="flex flex-col gap-1">
                  <span className="text-ink-2">Kode catatan (hash)</span>
                  <code className="type-code break-all rounded-[12px] bg-paper px-3 py-2 text-sm">{grading.auditHash}</code>
                </div>
                {detail.audit.length > 0 && (
                  <ul className="flex flex-col border-t border-line pt-1">
                    {detail.audit.map((entry) => (
                      <li key={entry.id} className="flex items-baseline justify-between gap-3 border-b border-line py-2 text-sm last:border-b-0">
                        <span>
                          {entry.action} <span className="text-ink-2">{entry.detail}</span>
                        </span>
                        <span className="tabular shrink-0 text-ink-3">{formatClock(entry.at)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <SourceNote simulated>Kode ini menandai isi catatan di perangkat ini. Belum ada pihak lain yang mengesahkannya.</SourceNote>
              </section>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <section aria-labelledby="kesegaran" className="panel flex flex-col gap-3 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 id="kesegaran" className="type-h2">
                  Es dan kesegaran
                </h2>
                {!finished && <Pill tone={fresh.tone}>{fresh.label}</Pill>}
              </div>
              <LedgerRow label="Jam darat" value={`${formatClock(landing.landedAt)} WIB`} />
              <LedgerRow label="Es" value={landing.iced ? "Pakai es" : "Tanpa es"} />
              <LedgerRow label="Batas segar" value={`${detail.windowHours} jam ${landing.iced ? "dengan es" : "tanpa es"}`} />
              {!finished && <LedgerRow label="Sudah berjalan" value={formatDuration(detail.elapsedMinutes)} />}
              {finished ? (
                <SourceNote>Pendaratan hari sebelumnya. Waktu segar tidak dihitung lagi.</SourceNote>
              ) : (
                <LedgerRow strong label="Sisa waktu segar" value={detail.remainingMinutes === 0 ? "Habis" : formatDuration(detail.remainingMinutes)} />
              )}
              {!landing.iced && species.histamineRisk && (
                <Notice tone="warning" title={`${species.name} tanpa es`}>
                  Ikan ini berisiko histamin dan tidak boleh masuk pesanan dapur SPPG.
                </Notice>
              )}
            </section>

            <section aria-labelledby="tujuan" className="panel flex flex-col gap-3 p-5">
              <h2 id="tujuan" className="type-h2">
                Tujuan ikan
              </h2>
              {destination === null ? (
                <p className="text-ink-2">Belum ditentukan. Tujuan dipilih di akhir penilaian.</p>
              ) : (
                <>
                  <LedgerRow strong label="Tujuan" value={DESTINATION_LABEL[destination]} />
                  {destination === "batch" && batch && (
                    <>
                      <LedgerRow label="Masuk pesanan" value={`${formatKg(view.batchedKg)} dari ${formatKg(landing.weightKg)}`} />
                      {landing.weightKg - view.batchedKg > 0 && (
                        <LedgerRow muted label="Sisa dijual ke TPI" value={formatKg(landing.weightKg - view.batchedKg)} />
                      )}
                      <Link
                        href={`/kub/batch/${batch.batch.id}`}
                        className="mt-1 flex min-h-14 items-center justify-between gap-3 rounded-[16px] border border-line px-4 hover:bg-paper"
                      >
                        <span className="flex flex-col leading-snug">
                          <span className="font-semibold">
                            {batch.species.name} untuk {batch.buyer.name}
                          </span>
                          <span className="type-code text-sm text-ink-2">{batch.batch.code}</span>
                        </span>
                        <span className="font-semibold text-sea-deep">Buka pesanan</span>
                      </Link>
                    </>
                  )}
                  {destination === "processing" && material && (
                    <>
                      <LedgerRow label="Bahan olahan" value={formatKg(material.kg)} />
                      <LedgerRow label="Harga bahan" value={`${formatRupiah(material.pricePerKg)} / kg`} />
                      <LedgerRow
                        muted
                        label="Status"
                        value={material.takenByProducerId ? "Sudah diambil UMKM" : "Menunggu diambil UMKM"}
                      />
                    </>
                  )}
                  {destination === "port_auction" && (
                    <p className="text-ink-2">Seluruh {formatKg(landing.weightKg)} dijual di TPI. Lihat harga acuan di Harga hari ini.</p>
                  )}
                  {destination === "not_for_consumption" && (
                    <p className="text-ink-2">Ikan ini tidak dijual untuk dimakan dan tidak masuk bagi hasil.</p>
                  )}
                </>
              )}
            </section>

            <Card tone="paper" className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-ink-2">
                Nelayan: <span className="font-semibold text-ink">Pak {fisher.name}</span>, anggota #{fisher.memberNumber}
              </p>
              <ButtonLink href={`/kub/anggota/${fisher.id}`} variant="secondary" size="md" icon="person">
                Profil anggota
              </ButtonLink>
            </Card>
          </div>
        </div>
      </RolePage>
    </>
  );
}
