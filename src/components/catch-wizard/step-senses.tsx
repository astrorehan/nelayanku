"use client";

import { OdorChoice, TextureChoice } from "@/components/grading/human-inputs";
import type { ReactNode } from "react";
import type { OdorOption, TextureOption } from "@/domain/freshness-score";
import { StepHeading } from "./wizard-frame";

export function StepSenses({
  subject,
  odor,
  onOdor,
  texture,
  onTexture,
}: {
  subject: ReactNode;
  odor: OdorOption | null;
  onOdor: (odor: OdorOption) => void;
  texture: TextureOption | null;
  onTexture: (texture: TextureOption) => void;
}) {
  return (
    <>
      {subject}
      <div className="flex flex-col gap-1.5">
        <StepHeading>Cium dan tekan ikannya</StepHeading>
        <p className="type-lead text-ink-2">Dua hal ini tidak bisa dinilai dari foto.</p>
      </div>
      <OdorChoice value={odor} onChange={onOdor} />
      <TextureChoice value={texture} onChange={onTexture} />
    </>
  );
}

export function sensesHint(odor: OdorOption | null, texture: TextureOption | null): string | null {
  if (!odor && !texture) {
    return "Pilih bau dan tekstur dulu";
  }
  if (!odor) {
    return "Pilih bau dulu";
  }
  return texture ? null : "Pilih tekstur dulu";
}
