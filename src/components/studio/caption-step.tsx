"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/fields";
import { Notice } from "@/components/ui/surface";
import type { Product, ProductCaptions } from "@/data/types";
import {
  computeCostOfGoods,
  suggestedRetailPrice,
} from "@/domain/cost-of-goods";
import { productCopy } from "@/domain/product-copy";
import { findForbiddenClaims } from "@/domain/label-compliance";
import { productionProblem } from "./cost-step";

const CHANNELS: Array<{ key: keyof ProductCaptions; label: string }> = [
  { key: "whatsappStatus", label: "Status WhatsApp" },
  { key: "marketplace", label: "Deskripsi toko online" },
  { key: "instagram", label: "Caption Instagram" },
];

export function CaptionStep({
  product,
  origin,
  onChange,
}: {
  product: Product;
  origin: string | null;
  onChange: (product: Product) => void;
}) {
  const [feedback, setFeedback] = useState("");
  const problem = productionProblem(product);
  const generate = () => {
    if (problem) return;
    const cost = computeCostOfGoods(product.run);
    onChange({
      ...product,
      captions: productCopy({
        name: product.name,
        brand: product.brand,
        grams: product.run.packNetWeightGrams,
        price: suggestedRetailPrice(cost.costPerPack, product.marginRate),
        ingredients: product.label.ingredients,
        origin,
      }),
    });
    setFeedback(
      "Tiga teks disusun dari isian Anda. Periksa sebelum dibagikan.",
    );
  };
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="type-h2">Siapkan teks jualan</h2>
        <p className="mt-2 text-ink-2">
          Template memakai nama, komposisi, asal bahan, dan harga yang Anda isi.
          Layanan AI teks belum dihubungkan.
        </p>
      </div>
      <Button
        variant="quiet"
        icon="edit"
        disabled={Boolean(problem)}
        onClick={generate}
      >
        Susun ulang dari isian
      </Button>
      {problem && <p className="text-danger-ink">{problem}</p>}
      {CHANNELS.map(({ key, label }) => {
        const text = product.captions[key];
        const claims = findForbiddenClaims({
          marketingText: text,
          halalCertificateNumber: product.label.halalCertificateNumber,
        });
        return (
          <section
            key={key}
            className="flex flex-col gap-3 border-t border-line pt-5"
          >
            <TextArea
              label={label}
              value={text}
              onChange={(event) =>
                onChange({
                  ...product,
                  captions: { ...product.captions, [key]: event.target.value },
                })
              }
              rows={5}
            />
            {claims.length > 0 && (
              <Notice
                tone="danger"
                title="Hapus klaim yang belum didukung sebelum membagikan"
              />
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="quiet"
                size="md"
                icon="copy"
                disabled={!text.trim() || claims.length > 0}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(text);
                    setFeedback(`${label} disalin`);
                  } catch {
                    setFeedback(
                      "Belum bisa menyalin. Pilih teks pada kolom, lalu salin manual.",
                    );
                  }
                }}
              >
                Salin teks
              </Button>
              <Button
                variant="ghost"
                size="md"
                icon="chat"
                disabled={!text.trim() || claims.length > 0}
                onClick={() => {
                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(text)}`,
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}
              >
                Buka WhatsApp
              </Button>
            </div>
          </section>
        );
      })}
      {feedback && <p role="status">{feedback}</p>}
    </div>
  );
}
