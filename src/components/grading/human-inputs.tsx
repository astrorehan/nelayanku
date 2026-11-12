"use client";

import { ChoiceGroup } from "@/components/ui/choices";
import { EYE_MANUAL_OPTIONS, GILL_MANUAL_OPTIONS, type EyeManualOption, type GillManualOption } from "@/ai/sample-photos";
import { ODOR_OPTIONS, TEXTURE_OPTIONS, type OdorOption, type TextureOption } from "@/domain/freshness-score";
import { EYE_MANUAL_LABEL, GILL_MANUAL_LABEL, ODOR_LABEL, TEXTURE_LABEL } from "@/content/labels";
import type { ReactNode } from "react";
import { EyeLook, GillLook } from "./part-looks";

function legendWithSource(title: string, source: string): ReactNode {
  return (
    <span className="flex items-baseline justify-between gap-3">
      <span>{title}</span>
      <span className="text-[0.9375rem] font-semibold text-ink-2">{source}</span>
    </span>
  );
}

export function EyeManualChoice({ value, onChange }: { value: EyeManualOption | null; onChange: (value: EyeManualOption) => void }) {
  return (
    <ChoiceGroup
      legend={legendWithSource("Mata", "dinilai manusia")}
      value={value}
      onChange={onChange}
      columns={1}
      options={EYE_MANUAL_OPTIONS.map((option) => ({
        value: option,
        title: EYE_MANUAL_LABEL[option].title,
        description: EYE_MANUAL_LABEL[option].hint,
        visual: <EyeLook option={option} />,
      }))}
    />
  );
}

export function GillManualChoice({ value, onChange }: { value: GillManualOption | null; onChange: (value: GillManualOption) => void }) {
  return (
    <ChoiceGroup
      legend={legendWithSource("Insang", "dinilai manusia")}
      value={value}
      onChange={onChange}
      columns={3}
      options={GILL_MANUAL_OPTIONS.map((option) => ({
        value: option,
        title: GILL_MANUAL_LABEL[option].title,
        description: GILL_MANUAL_LABEL[option].hint,
        visual: <GillLook option={option} />,
      }))}
    />
  );
}

export function OdorChoice({ value, onChange }: { value: OdorOption | null; onChange: (value: OdorOption) => void }) {
  return (
    <ChoiceGroup
      legend={legendWithSource("Bau", "dinilai manusia")}
      value={value}
      onChange={onChange}
      columns={4}
      options={ODOR_OPTIONS.map((option) => ({
        value: option,
        title: ODOR_LABEL[option].title,
        description: ODOR_LABEL[option].hint,
      }))}
    />
  );
}

export function TextureChoice({ value, onChange }: { value: TextureOption | null; onChange: (value: TextureOption) => void }) {
  return (
    <ChoiceGroup
      legend={legendWithSource("Tekstur", "dinilai manusia")}
      value={value}
      onChange={onChange}
      columns={4}
      options={TEXTURE_OPTIONS.map((option) => ({
        value: option,
        title: TEXTURE_LABEL[option].title,
        description: TEXTURE_LABEL[option].hint,
      }))}
    />
  );
}
