"use client";

import { useState } from "react";
import { EYE_MANUAL_PROBABILITIES, GILL_MANUAL_PROBABILITIES, type EyeManualOption, type GillManualOption } from "@/ai/sample-photos";
import { EyeManualChoice, GillManualChoice, OdorChoice, TextureChoice } from "@/components/grading/human-inputs";
import { Button } from "@/components/ui/button";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { Sheet } from "@/components/ui/overlays";
import { assessFreshness, type OdorOption, type TextureOption } from "@/domain/freshness-score";
import { formatScore } from "@/lib/format";

export function RecheckSheet({
  open,
  onOpenChange,
  shippedScore,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shippedScore: number | null;
  onSave: (score: number) => void;
}) {
  const [eye, setEye] = useState<EyeManualOption | null>(null);
  const [gill, setGill] = useState<GillManualOption | null>(null);
  const [odor, setOdor] = useState<OdorOption | null>(null);
  const [texture, setTexture] = useState<TextureOption | null>(null);
  const result =
    eye && gill && odor && texture
      ? assessFreshness({ eye: EYE_MANUAL_PROBABILITIES[eye], gill: GILL_MANUAL_PROBABILITIES[gill], odor, texture })
      : null;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Cek ulang 1 ikan"
      description="Pilih yang paling mirip dengan ikan yang Anda pegang."
      footer={
        <div className="flex flex-col gap-2 pb-1">
          {result ? (
            <p className="flex items-center justify-center gap-3">
              <GradeStamp grade={result.grade} size="sm" />
              <span className="font-bold">
                Skor cek ulang {formatScore(result.finalScore)}
                {shippedScore !== null ? ` · saat dikirim ${formatScore(shippedScore)}` : ""}
              </span>
            </p>
          ) : (
            <p className="text-center font-semibold text-ink-2">Isi keempat hal dulu</p>
          )}
          <Button size="xl" block disabled={!result} onClick={() => result && onSave(result.finalScore)}>
            Simpan cek ulang
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6 pb-2">
        <EyeManualChoice value={eye} onChange={setEye} />
        <GillManualChoice value={gill} onChange={setGill} />
        <OdorChoice value={odor} onChange={setOdor} />
        <TextureChoice value={texture} onChange={setTexture} />
      </div>
    </Sheet>
  );
}
