"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { BatchView } from "@/data/queries/batches";
import { documentsFor, type BuyerDocumentKind } from "@/data/queries/buyer-pages";
import { finalScore } from "@/domain/freshness-score";
import {
  formatClock,
  formatFullDate,
  formatKg,
  formatRupiah,
  formatScore,
} from "@/lib/format";
import { documentTable, escapeHtml, printDocument } from "@/lib/print-document";

const PARAMETER_LABELS = [
  ["eye", "Mata"],
  ["gill", "Insang"],
  ["odor", "Bau"],
  ["texture", "Tekstur"],
] as const;

const DECISION_LABEL = {
  accept_all: "Diterima semua",
  accept_partial: "Diterima sebagian",
  reject: "Ditolak",
} as const;

const SIMULATED_FOOTER =
  "<p><small>Dokumen simulasi untuk demo, bukan faktur pajak, bukti transfer, atau sertifikat resmi.</small></p>";

export const DOCUMENT_ICON: Record<BuyerDocumentKind, "ledger" | "shield" | "document"> = {
  faktur: "ledger",
  mutu: "shield",
  "berita-acara": "document",
};

function invoiceDocument(view: BatchView) {
  const kg = view.receipt?.acceptedKg ?? view.filledKg;
  const total = Math.round(kg * view.order.pricePerKg);
  const status =
    view.payment?.status === "paid"
      ? "Lunas (simulasi)"
      : view.payment?.status === "late"
        ? "Terlambat"
        : "Belum lunas";
  return `<p>Kode ${escapeHtml(view.batch.code)} · ${escapeHtml(formatFullDate(view.order.deliverAt))}</p><h2>Pembeli</h2><p>${escapeHtml(view.buyer.name)}<br>${escapeHtml(view.order.address)}</p>${documentTable(["Ikan", "Mutu", "Berat diterima", "Harga/kg", "Jumlah"], [[view.species.name, view.batchGrade ?? "—", formatKg(kg), formatRupiah(view.order.pricePerKg), formatRupiah(total)]])}<p>Status: ${status}</p><p>Total ${escapeHtml(formatRupiah(total))}</p><p>Biaya es, angkut, kas KUB, dan cadangan sudah termasuk harga.${view.buyer.kind === "sppg" ? " Biaya layanan platform Rp0 untuk SPPG." : " Biaya layanan platform 2% sudah termasuk harga."}</p><p>Dokumen simulasi, bukan faktur pajak atau bukti transfer. Pembayaran nyata dilakukan di luar demo.</p>`;
}

function qualityDocument(view: BatchView) {
  const parameters = view.averageParameters;
  const parameterRows = parameters
    ? PARAMETER_LABELS.map(([key, label]) => [label, formatScore(parameters[key])])
    : [];
  const contributionRows = view.contributions.map((item) => [
    formatClock(item.landing.landedAt),
    formatKg(item.kg),
    item.grading.grade,
    formatScore(finalScore(item.grading.parameters)),
    item.landing.iced ? "Ya" : "Tidak",
    item.grading.auditHash.slice(0, 12),
  ]);
  return `<p>Kode ${escapeHtml(view.batch.code)} · ${escapeHtml(view.species.name)} · ${escapeHtml(formatKg(view.filledKg))} · mutu ${escapeHtml(view.batchGrade ?? "—")}${view.averageScore !== null ? ` · skor ${escapeHtml(formatScore(view.averageScore))}` : ""}</p>${parameterRows.length ? `<h2>Skor rata-rata per parameter</h2>${documentTable(["Parameter", "Skor"], parameterRows)}` : ""}<h2>Asal ikan</h2><p>Tanggal ${escapeHtml(formatFullDate(view.order.deliverAt))}. ${view.allIced ? "Semua ikan memakai es." : "Ada ikan yang tidak memakai es."}</p>${documentTable(["Jam darat", "Berat", "Mutu", "Skor", "Es", "Cap data"], contributionRows)}<p><small>Cap data adalah 12 karakter pertama dari hash penilaian yang tersimpan di demo. Nama nelayan tidak dicantumkan.</small></p>${SIMULATED_FOOTER}`;
}

function receiptDocument(view: BatchView) {
  const receipt = view.receipt;
  if (!receipt) {
    return "";
  }
  const rows: Array<[string, string]> = [
    ["Keputusan", DECISION_LABEL[receipt.decision]],
    ["Dikirim", formatKg(view.filledKg)],
    ["Diterima", formatKg(receipt.decision === "reject" ? 0 : receipt.acceptedKg)],
    ["Waktu", `${formatFullDate(receipt.receivedAt)} ${formatClock(receipt.receivedAt)}`],
  ];
  if (receipt.reason) rows.push(["Alasan", receipt.reason]);
  if (receipt.note) rows.push(["Catatan", receipt.note]);
  if (receipt.recheckScore !== null) rows.push(["Skor cek ulang pembeli", formatScore(receipt.recheckScore)]);
  const photo = receipt.evidencePhotoDataUrl?.startsWith("data:image/")
    ? `<h2>Foto bukti</h2><p><img src="${escapeHtml(receipt.evidencePhotoDataUrl)}" alt="Foto bukti" style="max-width:100%;max-height:360px"></p>`
    : "";
  return `<p>Kode ${escapeHtml(view.batch.code)} · ${escapeHtml(view.species.name)} · ${escapeHtml(view.buyer.name)}</p>${documentTable(["Hal", "Isi"], rows)}${photo}${SIMULATED_FOOTER}`;
}

export function buyerDocumentTitle(kind: BuyerDocumentKind, view: BatchView): string {
  switch (kind) {
    case "faktur":
      return `Faktur simulasi ${view.batch.code}`;
    case "mutu":
      return `Dokumen mutu ${view.batch.code}`;
    case "berita-acara":
      return view.receipt?.decision === "reject"
        ? `Bukti penolakan ${view.batch.code}`
        : `Berita acara terima ${view.batch.code}`;
  }
}

export function buyerDocumentHtml(kind: BuyerDocumentKind, view: BatchView): string {
  switch (kind) {
    case "faktur":
      return invoiceDocument(view);
    case "mutu":
      return qualityDocument(view);
    case "berita-acara":
      return receiptDocument(view);
  }
}

/** Button that opens the print dialog (save as PDF) for one document of a batch. */
export function PrintDocumentButton({
  kind,
  view,
  label,
  variant = "quiet",
  block = false,
}: {
  kind: BuyerDocumentKind;
  view: BatchView;
  label?: string;
  variant?: "primary" | "quiet" | "secondary";
  block?: boolean;
}) {
  const [error, setError] = useState("");
  const entry = documentsFor(view).find((item) => item.kind === kind)!;
  return (
    <div className={block ? "flex w-full flex-col gap-1" : "flex flex-col gap-1"}>
      <Button
        icon="printer"
        variant={variant}
        size="md"
        block={block}
        disabled={!entry.available}
        aria-label={`${label ?? entry.title}, cetak atau simpan PDF, ${view.batch.code}`}
        onClick={async () => {
          try {
            setError("");
            await printDocument(buyerDocumentTitle(kind, view), buyerDocumentHtml(kind, view));
          } catch {
            setError("Dokumen belum terbuka. Coba lagi.");
          }
        }}
      >
        {label ?? "Cetak / PDF"}
      </Button>
      {error && (
        <p role="alert" className="text-danger-ink">
          {error}
        </p>
      )}
    </div>
  );
}
