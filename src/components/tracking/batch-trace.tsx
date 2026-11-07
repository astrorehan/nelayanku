"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { Card, Notice, SimulatedTag } from "@/components/ui/surface";
import { BATCH_STATUS_PILL } from "@/components/operator/order-card";
import { useDemoDatabase, useDemoHydrated, useDemoNow } from "@/data/demo-data-provider";
import {
  publicBatchTrace,
  type PublicBatchTrace,
} from "@/data/queries/tracking";
import {
  formatClock,
  formatFullDate,
  formatKg,
  formatScore,
} from "@/lib/format";
import {
  documentTable,
  downloadText,
  escapeHtml,
  printDocument,
} from "@/lib/print-document";

const PARAMETERS = [
  { key: "eye", label: "Mata" },
  { key: "gill", label: "Insang" },
  { key: "odor", label: "Bau" },
  { key: "texture", label: "Tekstur" },
] as const;

export function qualityDocument(trace: PublicBatchTrace): string {
  return `<p>Status kiriman: ${escapeHtml(BATCH_STATUS_PILL[trace.status].label)} (simulasi).</p>${trace.status === "rejected" ? "<p>Seluruh kiriman ditolak saat penerimaan. Skor berikut adalah penilaian awal di dermaga, bukan hasil cek ulang atau pernyataan aman.</p>" : ""}<p>Kode <strong>${escapeHtml(trace.code)}</strong> · ${escapeHtml(trace.species)} · ${escapeHtml(formatKg(trace.kg))} · mutu ${escapeHtml(trace.grade ?? "belum dinilai")}</p><p>${escapeHtml(trace.kub)}, ${escapeHtml(trace.regency)}</p><p>Skor rata-rata tertimbang berat, ${trace.score === null ? "belum dinilai" : escapeHtml(formatScore(trace.score))} dari 9. Mutu kiriman mengikuti mutu terendah.</p>${documentTable(
    ["Asal", "Berat", "Mutu", "Skor", "Jam darat", "Es"],
    trace.contributions.map((item) => [
      item.fisherLabel,
      formatKg(item.kg),
      item.grade,
      formatScore(item.score),
      `${formatClock(item.landedAt)} WIB`,
      item.iced ? "Ya" : "Tidak",
    ]),
  )}${trace.contributions
    .map(
      (item) =>
        `<h2>${escapeHtml(item.fisherLabel)}</h2>${documentTable(
          ["Parameter", "Skor"],
          PARAMETERS.map(({ key, label }) => [
            label,
            formatScore(item.parameters[key]),
          ]),
        )}<p>Versi ${escapeHtml(item.modelVersion)}</p><p>SHA-256 <code>${escapeHtml(item.auditHash)}</code></p>`,
    )
    .join(
      "",
    )}<p>Penilaian gaya SNI 2729 mencakup 4 dari 6 parameter, bukan sertifikat SNI dan tidak mengukur histamin. Cap data hanya memeriksa kecocokan isi lokal, bukan jaminan asal atau keamanan pangan.</p>`;
}

export function BatchTrace({ code }: { code: string }) {
  const hydrated = useDemoHydrated();
  const db = useDemoDatabase();
  const now = useDemoNow();
  const trace = publicBatchTrace(db, code, now);
  const [feedback, setFeedback] = useState("");
  if (!hydrated) return <p aria-busy="true">Membuka catatan mutu…</p>;
  if (!trace)
    return (
      <div className="flex flex-col gap-4">
        <Notice tone="warning" title="Kode kiriman tidak ditemukan">
          Periksa kembali kode di label. Kiriman yang dibuat di demo tersimpan
          pada browser tempat Anda mencatatnya.
        </Notice>
        <ButtonLink href="/lacak" icon="arrowLeft">
          Isi kode lain
        </ButtonLink>
      </div>
    );
  const status = BATCH_STATUS_PILL[trace.status];
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="type-code">{trace.code}</span>
        <SimulatedTag />
        <span className="text-ink-2">{status.label}</span>
      </div>
      {trace.status === "rejected" && (
        <Notice tone="danger" title="Kiriman ditolak saat penerimaan">
          Seluruh kiriman ditolak. Skor di bawah adalah penilaian awal di dermaga, bukan hasil cek ulang atau pernyataan bahwa ikan aman dimakan.
        </Notice>
      )}
      <Card className="flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex items-center gap-5">
          {trace.grade && <GradeStamp grade={trace.grade} size="lg" />}
          <div>
            <h1 className="type-h1">
              {trace.species} · {formatKg(trace.kg)}
            </h1>
            <p className="mt-2 text-ink-2">
              {trace.score === null
                ? "Belum ada ikan yang dinilai"
                : `Skor ${formatScore(trace.score)} dari 9 · gaya SNI 2729`}
            </p>
          </div>
        </div>
        <dl className="grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
          <div>
            <dt className="text-ink-2">Asal</dt>
            <dd>
              {trace.kub}
              <br />
              {trace.port}, {trace.regency}
            </dd>
          </div>
          <div>
            <dt className="text-ink-2">Pendaratan pertama</dt>
            <dd>
              {trace.landedAt
                ? `${formatClock(trace.landedAt)} WIB · ${formatFullDate(trace.landedAt)}`
                : "Belum ada pendaratan"}
            </dd>
          </div>
          <div>
            <dt className="text-ink-2">Catatan es</dt>
            <dd>
              {trace.contributions.length
                ? trace.iced
                  ? "Semua pendaratan memakai es"
                  : "Ada ikan tanpa es"
                : "Belum tercatat"}
            </dd>
          </div>
          <div>
            <dt className="text-ink-2">Berangkat</dt>
            <dd>
              {trace.departedAt
                ? `${formatClock(trace.departedAt)} WIB`
                : "Belum berangkat"}
            </dd>
          </div>
        </dl>
        {trace.parameters && (
          <div>
            <h2 className="type-h3 mb-3">Rata-rata parameter</h2>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {PARAMETERS.map(({ key, label }) => (
                <div key={key}>
                  <dt className="text-ink-2">{label}</dt>
                  <dd className="tabular text-2xl">
                    {formatScore(trace.parameters![key])}
                    <span className="text-base text-ink-2"> / 9</span>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-sm text-ink-2">
              Rata-rata dibobot menurut berat. Mutu kiriman memakai mutu
              terendah dari pendaratan penyusunnya.
            </p>
          </div>
        )}
      </Card>
      <Notice tone="neutral" title="Bukti penilaian, bukan jaminan keamanan">
        Empat dari enam parameter SNI 2729 dinilai. Skor tidak mengukur
        histamin. Tetap simpan dingin dan periksa ulang saat menerima ikan.
      </Notice>
      <section className="flex flex-col gap-3" aria-labelledby="asal-ikan">
        <h2 id="asal-ikan" className="type-h2">
          Asal dan cap data
        </h2>
        <p className="text-ink-2">
          Identitas nelayan disamarkan. Buka tiap catatan untuk memeriksa
          rincian.
        </p>
        {trace.contributions.map((item, index) => (
          <details
            key={index}
            className="rounded-[12px] border border-line bg-surface p-4"
          >
            <summary className="min-h-12 cursor-pointer py-3 font-medium">
              {item.fisherLabel} · {formatKg(item.kg)} · mutu {item.grade}
            </summary>
            <div className="flex flex-col gap-3 border-t border-line pt-4">
              <p>
                Darat {formatClock(item.landedAt)} WIB ·{" "}
                {item.iced ? "pakai es" : "tanpa es"}
              </p>
              <dl className="grid grid-cols-2 gap-3">
                {PARAMETERS.map(({ key, label }) => (
                  <div key={key}>
                    <dt className="text-ink-2">{label}</dt>
                    <dd className="tabular">
                      {formatScore(item.parameters[key])} / 9
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="text-sm text-ink-2">
                Versi penilaian: {item.modelVersion}
              </p>
              {item.gradeAdjusted && (
                <p>Mutu diubah operator; alasan tersimpan pada catatan KUB</p>
              )}
              <p
                className={
                  item.hashMatches ? "text-success-ink" : "text-danger-ink"
                }
              >
                {item.hashMatches
                  ? "Cap cocok dengan isi catatan"
                  : "Cap tidak cocok, periksa dengan operator"}
              </p>
              <code className="break-all text-sm text-ink-2">
                {item.auditHash}
              </code>
            </div>
          </details>
        ))}
      </section>
      <p className="text-sm text-ink-2">
        SHA-256 memeriksa kecocokan isi catatan di browser ini. Cap ini tidak
        membuktikan keaslian pihak pencatat.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          disabled={!trace.contributions.length}
          icon="printer"
          onClick={async () => {
            try {
              await printDocument(
                `Dokumen mutu ${trace.code}`,
                qualityDocument(trace),
              );
            } catch {
              setFeedback("Dokumen belum terbuka. Coba lagi.");
            }
          }}
        >
          Cetak / simpan PDF
        </Button>
        <Button
          variant="quiet"
          icon="download"
          onClick={() =>
            downloadText(
              `mutu-${trace.code}.json`,
              JSON.stringify(trace, null, 2),
              "application/json",
            )
          }
        >
          Unduh data mutu
        </Button>
      </div>
      {feedback && <p role="status">{feedback}</p>}
      <ButtonLink
        href="/lacak"
        variant="ghost"
        icon="arrowLeft"
        className="self-start"
      >
        Lacak kiriman lain
      </ButtonLink>
    </div>
  );
}
