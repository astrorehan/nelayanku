"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons/icon";
import { Button, buttonClasses } from "@/components/ui/button";
import { Sheet } from "@/components/ui/overlays";
import type { BatchView } from "@/data/queries/batches";
import type { Kub } from "@/data/types";
import { formatKg } from "@/lib/format";
import { renderShippingLabel, shippingLabelData, shippingLabelDescription, type ShippingLabelData } from "./shipping-label";

function trackUrlFor(code: string) {
  return `${window.location.origin}/lacak/${code}`;
}

function printImage(imageUrl: string, code: string) {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  frame.srcdoc = `<!doctype html><title>Label ${code}</title><style>@page{size:60mm 40mm;margin:0}html,body{margin:0}img{display:block;width:60mm;height:40mm}</style><img src="${imageUrl}" alt="">`;
  frame.addEventListener("load", () => {
    const printWindow = frame.contentWindow;
    if (!printWindow) {
      frame.remove();
      return;
    }
    printWindow.addEventListener("afterprint", () => frame.remove());
    printWindow.focus();
    printWindow.print();
  });
  document.body.appendChild(frame);
}

async function shareLabel(imageUrl: string, data: ShippingLabelData) {
  const text = `Label kiriman ${data.code}: ${data.speciesName} mutu ${data.grade}, ${formatKg(data.weightKg)}. Bukti mutu: ${trackUrlFor(data.code)}`;
  const blob = await (await fetch(imageUrl)).blob();
  const file = new File([blob], `label-${data.code}.png`, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `Label ${data.code}`, text });
    } catch {
      return;
    }
    return;
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
}

export function LabelSheet({
  open,
  onOpenChange,
  view,
  kub,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  view: BatchView;
  kub: Kub;
}) {
  const data = shippingLabelData(view, kub);
  const dataKey = data ? JSON.stringify(data) : null;
  const [rendered, setRendered] = useState<{ key: string; imageUrl: string } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open || !dataKey) {
      return;
    }
    let cancelled = false;
    renderShippingLabel(JSON.parse(dataKey) as ShippingLabelData, window.location.origin)
      .then((imageUrl) => {
        if (!cancelled) {
          setRendered({ key: dataKey, imageUrl });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, dataKey]);

  const imageUrl = rendered && rendered.key === dataKey ? rendered.imageUrl : null;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Label kiriman"
      description="Tempel di wadah dengan QR menghadap keluar."
      footer={
        data && (
          <div className="flex flex-col gap-2 pb-1">
            <Button size="xl" block icon="chat" disabled={!imageUrl} onClick={() => imageUrl && void shareLabel(imageUrl, data)}>
              Bagikan ke WA
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={imageUrl ?? undefined}
                download={`label-${data.code}.png`}
                aria-disabled={!imageUrl}
                aria-label="Simpan gambar label"
                className={buttonClasses({ variant: "quiet", size: "lg" })}
              >
                <Icon name="download" size={22} />
                Simpan
              </a>
              <Button variant="quiet" size="lg" icon="printer" disabled={!imageUrl} onClick={() => imageUrl && printImage(imageUrl, data.code)}>
                Cetak
              </Button>
            </div>
          </div>
        )
      }
    >
      <div className="flex flex-col gap-3 pb-2">
        {!data ? (
          <p className="text-ink-2">Kiriman ini belum berisi ikan bermutu, jadi belum bisa diberi label.</p>
        ) : imageUrl ? (
          <Image
            src={imageUrl}
            alt={shippingLabelDescription(data)}
            width={480}
            height={320}
            unoptimized
            className="h-auto w-full rounded-[10px] border border-line bg-white shadow-raised"
          />
        ) : (
          <div className="grid aspect-[3/2] w-full place-items-center rounded-[10px] border border-line bg-white">
            <p className="flex items-center gap-2 font-bold text-ink-2">
              <Icon name={failed ? "warning" : "sync"} size={20} className={failed ? undefined : "animate-spin"} />
              {failed ? "Label gagal dibuat. Tutup lalu buka lagi." : "Menyiapkan label…"}
            </p>
          </div>
        )}
        <p className="text-[0.9375rem] leading-snug text-ink-2">
          Ukuran 60 × 40 mm untuk printer termal 203 dpi. Tanpa printer, kirim gambarnya ke WA atau tulis kodenya di wadah.
        </p>
      </div>
    </Sheet>
  );
}
