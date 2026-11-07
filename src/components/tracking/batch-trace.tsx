"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { GradeStamp } from "@/components/ui/grade-stamp";
import {
  Card,
  Notice,
  Pill,
  SimulatedTag,
  type PillTone,
} from "@/components/ui/surface";
import {
  ColdGauge,
  ContributionList,
  ParameterPanel,
  ReceiptPanel,
} from "@/components/tracking/trace-panels";
import { TraceTimeline } from "@/components/tracking/trace-timeline";
import { BATCH_STATUS_PILL } from "@/components/operator/order-card";
import { useDemoDatabase, useDemoHydrated, useDemoNow } from "@/data/demo-data-provider";
import {
  publicBatchTrace,
  traceTimeline,
  type PublicBatchTrace,
} from "@/data/queries/tracking";
import { formatClock, formatKg, formatScore } from "@/lib/format";
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

function statusPill(trace: PublicBatchTrace): { label: string; tone: PillTone } {
  if (trace.status === "received" && trace.receipt?.decision === "accept_partial")
    return { label: "Diterima sebagian", tone: "warning" };
  return BATCH_STATUS_PILL[trace.status];
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
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <h1 className="type-title">Kiriman belum ditemukan</h1>
        <Notice tone="warning" title="Kode kiriman tidak ditemukan">
          Periksa kembali kode di label. Kiriman yang dibuat di demo tersimpan
          pada browser tempat Anda mencatatnya.
        </Notice>
        <ButtonLink href="/lacak" icon="arrowLeft" className="self-start">
          Isi kode lain
        </ButtonLink>
      </div>
    );
  const status = statusPill(trace);
  const steps = traceTimeline(trace);
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="type-code">{trace.code}</span>
          <Pill tone={status.tone}>{status.label}</Pill>
          <SimulatedTag />
        </div>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
          {trace.grade && <GradeStamp grade={trace.grade} size="lg" />}
          <div className="min-w-0">
            <h1 className="type-title">
              {trace.species} · {formatKg(trace.kg)}
            </h1>
            <p className="mt-2 text-ink-2">
              {trace.score === null
                ? "Belum ada ikan yang dinilai"
                : `Skor ${formatScore(trace.score)} dari 9 · gaya SNI 2729`}
            </p>
            <p className="text-ink-2">
              {trace.kub} · {trace.port}, {trace.regency}
            </p>
          </div>
        </div>
      </header>
      {trace.status === "rejected" && (
        <Notice tone="danger" title="Kiriman ditolak saat penerimaan">
          Seluruh kiriman ditolak. Skor di bawah adalah penilaian awal di dermaga, bukan hasil cek ulang atau pernyataan bahwa ikan aman dimakan.
        </Notice>
      )}
      <Card className="flex flex-col gap-5 p-5 sm:p-6 lg:p-8">
        <h2 className="type-h2">Perjalanan kiriman</h2>
        <TraceTimeline steps={steps} />
      </Card>
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <ColdGauge trace={trace} />
          <ReceiptPanel trace={trace} />
        </div>
        <ParameterPanel trace={trace} />
      </div>
      <Notice tone="neutral" title="Bukti penilaian, bukan jaminan keamanan">
        Empat dari enam parameter SNI 2729 dinilai. Skor tidak mengukur
        histamin. Tetap simpan dingin dan periksa ulang saat menerima ikan.
      </Notice>
      <ContributionList trace={trace} />
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
