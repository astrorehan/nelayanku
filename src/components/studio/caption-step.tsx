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
import { AI_FALLBACK_MESSAGE, requestAiCaptions } from "./ai-copy";
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
  const [writing, setWriting] = useState(false);
  const problem = productionProblem(product);
  const facts = () => {
    const cost = computeCostOfGoods(product.run);
    return {
      name: product.name.trim().slice(0, 80),
      brand: product.brand.trim().slice(0, 60),
      grams: Math.round(product.run.packNetWeightGrams),
      price: Math.round(suggestedRetailPrice(cost.costPerPack, product.marginRate)),
      ingredients: product.label.ingredients
        .map((value) => value.trim().slice(0, 60))
        .filter(Boolean)
        .slice(0, 15),
      origin: origin ? origin.slice(0, 120) : null,
      ownerNote: product.spokenDescription.trim().slice(0, 500),
    };
  };
  const generate = () => {
    if (problem) return;
    const input = facts();
    onChange({ ...product, captions: productCopy(input) });
    setFeedback(
      "Tiga teks disusun dari isian Anda. Periksa sebelum dibagikan.",
    );
  };
  const generateWithAi = async () => {
    if (problem || writing) return;
    setWriting(true);
    setFeedback("AI sedang menyusun tiga teks…");
    const input = facts();
    const outcome = await requestAiCaptions(input);
    setWriting(false);
    if (outcome.ok) {
      onChange({ ...product, captions: outcome.captions });
      setFeedback(
        "Tiga teks disusun AI dari isian Anda dan lolos pemeriksaan klaim. Baca dan sunting sebelum dibagikan.",
      );
      return;
    }
    onChange({ ...product, captions: productCopy(input) });
    setFeedback(AI_FALLBACK_MESSAGE[outcome.reason]);
  };
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="type-h2">Siapkan teks jualan</h2>
        <p className="mt-2 text-ink-2">
          AI (Claude Haiku) menulis tiga teks hanya dari nama, komposisi, berat,
          asal bahan, harga, dan catatan Anda. Teks yang menyebut izin, halal,
          atau manfaat kesehatan ditolak otomatis. Tanpa sinyal, template dipakai.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          icon="edit"
          disabled={Boolean(problem) || writing}
          onClick={generateWithAi}
        >
          {writing ? "Menyusun…" : "Susun dengan AI"}
        </Button>
        <Button
          variant="quiet"
          icon="reset"
          disabled={Boolean(problem) || writing}
          onClick={generate}
        >
          Susun ulang dari isian
        </Button>
      </div>
      {problem && <p className="text-danger-ink">{problem}</p>}
      <p role="status" className="text-ink-2 empty:hidden">
        {feedback}
      </p>
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
    </div>
  );
}
