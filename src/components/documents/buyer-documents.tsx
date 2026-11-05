"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Sheet } from "@/components/ui/overlays";
import { Notice } from "@/components/ui/surface";
import type { BatchView } from "@/data/queries/batches";
import { formatFullDate, formatKg, formatRupiah } from "@/lib/format";
import { documentTable, escapeHtml, printDocument } from "@/lib/print-document";

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

export function BuyerDocuments({ view }: { view: BatchView }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <Button
        variant="ghost"
        size="md"
        icon="download"
        onClick={() => setOpen(true)}
        aria-label={`Dokumen ${view.batch.code}`}
      >
        Dokumen
      </Button>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        title={`Dokumen ${view.batch.code}`}
        description={`${view.species.name} · ${formatKg(view.receipt?.acceptedKg ?? view.filledKg)}`}
      >
        <div className="flex flex-col gap-4">
          <ButtonLink
            href={`/lacak/${view.batch.code}`}
            variant="quiet"
            icon="shield"
            block
          >
            Bukti mutu dan asal ikan
          </ButtonLink>
          <Button
            icon="printer"
            block
            disabled={!view.receipt || view.receipt.decision === "reject"}
            onClick={async () => {
              try {
                await printDocument(
                  `Faktur simulasi ${view.batch.code}`,
                  invoiceDocument(view),
                );
              } catch {
                setError("Faktur belum terbuka. Coba lagi.");
              }
            }}
          >
            Faktur / simpan PDF
          </Button>
          {(!view.receipt || view.receipt.decision === "reject") && (
            <p className="text-ink-2">
              Faktur tersedia setelah ada ikan yang diterima
            </p>
          )}
          {error && <Notice tone="danger" title={error} />}
        </div>
      </Sheet>
    </>
  );
}
