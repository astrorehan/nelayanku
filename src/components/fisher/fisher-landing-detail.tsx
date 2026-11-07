"use client";

import Link from "next/link";
import { Icon } from "@/components/icons/icon";
import { ParameterBars, ScoreHeadline } from "@/components/grading/score-summary";
import { RolePage } from "@/components/layout/role-shell";
import { FisherTopBar } from "@/components/shells/role-shells";
import { ButtonLink } from "@/components/ui/button";
import { Card, LedgerRow, Notice, Pill, SourceNote } from "@/components/ui/surface";
import { ODOR_LABEL, TEXTURE_LABEL } from "@/content/labels";
import { useDemoHydrated, useDemoNow } from "@/data/demo-data-provider";
import { fisherLandingDetail } from "@/data/queries/fisher-pages";
import type { ReceiptDecision } from "@/data/types";
import { formatClock, formatKg, formatRupiah, formatShortDayDate } from "@/lib/format";
import { NotFoundCard, StatusPill, useFisher } from "./fisher-shared";

const BACK = { href: "/nelayan/tangkapan", label: "Kembali ke tangkapan" };

const RECEIPT_LABEL: Record<ReceiptDecision, string> = {
  accept_all: "Diterima semua",
  accept_partial: "Diterima sebagian",
  reject: "Ditolak",
};

export function FisherLandingDetail({ landingId }: { landingId: string }) {
  const { db, fisher } = useFisher();
  const now = useDemoNow();
  const hydrated = useDemoHydrated();
  const detail = fisherLandingDetail(db, fisher.id, landingId, now);

  if (!detail) {
    if (!hydrated) {
      return (
        <>
          <FisherTopBar title="Memuat" back={BACK} />
          <RolePage>
            <p className="text-ink-2">Memuat catatan…</p>
          </RolePage>
        </>
      );
    }
    return (
      <>
        <FisherTopBar title="Tangkapan tidak ditemukan" back={BACK} />
        <RolePage>
          <NotFoundCard title="Tangkapan ini tidak ada" back={BACK} />
        </RolePage>
      </>
    );
  }

  const { view, status, batch, payout, processingMaterialId } = detail;
  const { landing, grading, species } = view;
  const overridden = grading && grading.modelGrade !== grading.grade;

  return (
    <>
      <FisherTopBar
        title={`${formatKg(landing.weightKg)} ${species.name.toLowerCase()}`}
        subtitle={formatShortDayDate(landing.landedAt)}
        back={BACK}
      />
      <RolePage>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          <section aria-labelledby="mutu" className="flex flex-col gap-4">
            <h2 id="mutu" className="type-h3">
              Mutu ikan
            </h2>
            {grading ? (
              <Card className="flex flex-col gap-5 p-5">
                <ScoreHeadline grade={grading.grade} finalScore={grading.finalScore} stampKey={grading.id} />
                <ParameterBars
                  parameters={grading.parameters}
                  sources={{
                    eye: grading.eyeSource === "model" ? "AI" : "manusia",
                    gill: grading.gillSource === "model" ? "AI" : "manusia",
                    odor: "manusia",
                    texture: "manusia",
                  }}
                  notes={{
                    odor: ODOR_LABEL[grading.odor].title,
                    texture: TEXTURE_LABEL[grading.texture].title,
                  }}
                />
                {overridden && (
                  <Notice tone="info" title={`Operator mengubah mutu dari ${grading.modelGrade} ke ${grading.grade}`}>
                    {grading.overrideReason ?? "Alasan tidak dicatat."}
                  </Notice>
                )}
                <SourceNote simulated>
                  Dinilai {formatShortDayDate(grading.gradedAt)}, {formatClock(grading.gradedAt)}. Model{" "}
                  {grading.modelVersion}. Jejak penilaian tersimpan dengan kode {grading.auditHash.slice(0, 10)}.
                </SourceNote>
              </Card>
            ) : (
              <Notice tone="warning" title="Belum dinilai">
                Operator KUB belum menilai ikan ini. Kabar mutunya muncul di sini setelah dinilai.
              </Notice>
            )}
          </section>

          <div className="flex flex-col gap-6">
            <section aria-labelledby="darat" className="flex flex-col gap-2">
              <h2 id="darat" className="type-h3">
                Waktu darat
              </h2>
              <Card className="flex flex-col gap-3 p-5">
                <LedgerRow label="Jam darat" value={`${formatClock(landing.landedAt)} WIB`} />
                <LedgerRow label="Tanggal" value={formatShortDayDate(landing.landedAt)} />
                <LedgerRow label="Berat" value={formatKg(landing.weightKg)} />
                <p className="flex items-center gap-2">
                  <Pill tone={landing.iced ? "success" : "warning"} icon="ice">
                    {landing.iced ? "Pakai es" : "Tanpa es"}
                  </Pill>
                  {!landing.iced && <span className="text-ink-2">Tanpa es, ikan lebih cepat turun mutunya.</span>}
                </p>
              </Card>
            </section>

            <section aria-labelledby="ke-mana" className="flex flex-col gap-2">
              <h2 id="ke-mana" className="type-h3">
                Ke mana ikannya
              </h2>
              <Card className="flex flex-col gap-3 p-5">
                <p>
                  <StatusPill kind={status.kind} label={status.label} />
                </p>
                {batch && (
                  <>
                    <LedgerRow label="Kode kiriman" value={batch.batch.code} />
                    <LedgerRow label="Pembeli" value={batch.buyer.name} />
                    <LedgerRow label="Ikan Bapak di kiriman" value={formatKg(view.batchedKg)} />
                    {view.batchedKg < landing.weightKg && (
                      <p className="leading-snug text-ink-2">
                        Sisa {formatKg(landing.weightKg - view.batchedKg)} dijual di TPI.
                      </p>
                    )}
                    <LedgerRow
                      label="Setelah diperiksa"
                      value={batch.receipt ? RECEIPT_LABEL[batch.receipt.decision] : "Belum diterima"}
                    />
                    {batch.receipt && batch.receipt.decision !== "reject" && (
                      <LedgerRow label="Diterima" value={formatKg(batch.receipt.acceptedKg)} />
                    )}
                    <ButtonLink
                      href={`/lacak/${batch.batch.code}`}
                      variant="secondary"
                      size="md"
                      icon="qr"
                      className="self-start"
                    >
                      Lihat jejak kiriman
                    </ButtonLink>
                  </>
                )}
                {!batch && processingMaterialId && (
                  <>
                    <p className="leading-snug text-ink-2">Ikan ini jadi bahan olahan UMKM. Tidak ada yang terbuang.</p>
                    <ButtonLink
                      href={`/lacak/bahan/${processingMaterialId}`}
                      variant="secondary"
                      size="md"
                      icon="qr"
                      className="self-start"
                    >
                      Lihat asal bahan
                    </ButtonLink>
                  </>
                )}
                {!batch && !processingMaterialId && status.kind === "port" && (
                  <p className="leading-snug text-ink-2">Dijual di TPI dengan harga pelelangan hari itu.</p>
                )}
                {!batch && !processingMaterialId && status.kind === "waiting" && (
                  <p className="leading-snug text-ink-2">Belum ditentukan tujuannya. Operator KUB akan memilihkan.</p>
                )}
                {status.kind === "not_edible" && (
                  <p className="leading-snug text-ink-2">Ikan ini tidak layak dimakan, jadi tidak dijual.</p>
                )}
              </Card>
            </section>

            {payout && (
              <Link href={`/nelayan/uang/${payout.batchId}`} className="group block rounded-[20px]">
                <Card className="flex items-center gap-3 p-5 group-hover:bg-paper">
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-ink-2">Uang untuk kiriman ini</span>
                    <span className="type-figure-stat">{formatRupiah(payout.net)}</span>
                    <span className="font-semibold text-sea-deep">Kenapa harganya segini</span>
                  </span>
                  <Icon name="chevronRight" size={20} className="shrink-0 text-ink-3" />
                </Card>
              </Link>
            )}
          </div>
        </div>
      </RolePage>
    </>
  );
}
