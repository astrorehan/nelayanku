"use client";

import { useId, useState } from "react";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { SimulatedTag } from "@/components/ui/surface";
import { GRADE_MEANING, ODOR_LABEL, TEXTURE_LABEL } from "@/content/labels";
import {
  ODOR_OPTIONS,
  ODOR_SCORE,
  PRIME_MINIMUM_FINAL_SCORE,
  PRIME_MINIMUM_PARAMETER_SCORE,
  PROCESSING_MINIMUM_FINAL_SCORE,
  TEXTURE_OPTIONS,
  TEXTURE_SCORE,
  finalScore,
  gradeFromParameters,
  type ParameterScores,
} from "@/domain/freshness-score";
import type { Grade } from "@/domain/grade";
import { formatScore } from "@/lib/format";
import { GradeThresholdBar } from "./grade-threshold-bar";

function SliderField({
  label,
  hint,
  min,
  max,
  step,
  value,
  onChange,
  valueText,
  display,
  lowLabel,
  highLabel,
}: {
  label: string;
  hint: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  valueText: string;
  display: string;
  lowLabel: string;
  highLabel: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="font-semibold">
          {label}
        </label>
        <span className="tabular font-semibold" aria-hidden>
          {display}
        </span>
      </div>
      <p className="text-sm text-ink-2">{hint}</p>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={valueText}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-12 w-full cursor-pointer accent-sea"
      />
      <div className="flex justify-between text-xs text-ink-2" aria-hidden>
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

function reasonFor(
  grade: Grade,
  score: number,
  parameters: ParameterScores,
  rotten: boolean,
): string {
  if (rotten) {
    return "Bau busuk memveto: mutu tolak berapa pun skor lainnya.";
  }
  if (grade === "REJECT") {
    return `Skor di bawah ${formatScore(PROCESSING_MINIMUM_FINAL_SCORE)}, jadi tolak.`;
  }
  if (
    score >= PRIME_MINIMUM_FINAL_SCORE &&
    Math.min(...Object.values(parameters)) < PRIME_MINIMUM_PARAMETER_SCORE
  ) {
    return `Skor cukup untuk A, tetapi ada parameter di bawah ${PRIME_MINIMUM_PARAMETER_SCORE}, jadi turun ke B.`;
  }
  if (grade === "A") {
    return "Skor 8,0 ke atas dan semua parameter minimal 7.";
  }
  if (grade === "B") {
    return "Skor 7,0 ke atas, batas minimal SNI.";
  }
  return "Skor di bawah 7,0 tetapi masih layak diolah.";
}

export function ScoreExplorer() {
  const [eye, setEye] = useState(8.6);
  const [gill, setGill] = useState(8.1);
  const [odorIndex, setOdorIndex] = useState(0);
  const [textureIndex, setTextureIndex] = useState(1);

  const odor = ODOR_OPTIONS[odorIndex];
  const texture = TEXTURE_OPTIONS[textureIndex];
  const parameters: ParameterScores = {
    eye,
    gill,
    odor: ODOR_SCORE[odor],
    texture: TEXTURE_SCORE[texture],
  };
  const score = finalScore(parameters);
  const grade = gradeFromParameters(parameters, odor);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,24rem)] lg:gap-12">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <SimulatedTag />
          <p className="text-sm text-ink-2">
            Rumusnya sungguhan, masukannya Anda yang geser. Bukan hasil model.
          </p>
        </div>
        <SliderField
          label="Mata"
          hint="Di aplikasi, skor ini datang dari foto mata."
          min={5}
          max={9}
          step={0.1}
          value={eye}
          onChange={setEye}
          valueText={`${formatScore(eye)} dari 9`}
          display={formatScore(eye)}
          lowLabel="5 · tidak segar"
          highLabel="9 · sangat segar"
        />
        <SliderField
          label="Insang"
          hint="Di aplikasi, skor ini datang dari foto insang atau pilihan operator."
          min={5}
          max={9}
          step={0.1}
          value={gill}
          onChange={setGill}
          valueText={`${formatScore(gill)} dari 9`}
          display={formatScore(gill)}
          lowLabel="5 · coklat kelabu"
          highLabel="9 · merah cerah"
        />
        <SliderField
          label="Bau"
          hint="Selalu dicium operator, dipilih dari empat pilihan."
          min={0}
          max={ODOR_OPTIONS.length - 1}
          step={1}
          value={odorIndex}
          onChange={setOdorIndex}
          valueText={`${ODOR_LABEL[odor].title}, skor ${parameters.odor}`}
          display={`${ODOR_LABEL[odor].title} · ${parameters.odor}`}
          lowLabel="Segar"
          highLabel="Busuk"
        />
        <SliderField
          label="Tekstur"
          hint="Selalu ditekan operator, dipilih dari empat pilihan."
          min={0}
          max={TEXTURE_OPTIONS.length - 1}
          step={1}
          value={textureIndex}
          onChange={setTextureIndex}
          valueText={`${TEXTURE_LABEL[texture].title}, skor ${parameters.texture}`}
          display={`${TEXTURE_LABEL[texture].title} · ${parameters.texture}`}
          lowLabel="Padat"
          highLabel="Sangat lunak"
        />
      </div>
      <div className="flex flex-col gap-5 rounded-[16px] bg-sky-tint p-5 lg:self-start">
        <p className="type-eyebrow">Hasil rumus</p>
        <div role="status" className="flex items-center gap-4">
          <GradeStamp grade={grade} size="lg" />
          <div className="min-w-0">
            <p className="flex items-baseline gap-2">
              <span className="type-num-xl">{formatScore(score)}</span>
              <span className="text-ink-2">dari 9</span>
            </p>
            <p className="text-sm text-ink-2">{GRADE_MEANING[grade]}</p>
          </div>
        </div>
        <p className="text-sm">{reasonFor(grade, score, parameters, odor === "rotten")}</p>
        <GradeThresholdBar score={score} grade={grade} />
        <p className="tabular text-sm text-ink-2">
          ({formatScore(parameters.eye)} + {formatScore(parameters.gill)} +{" "}
          {formatScore(parameters.odor)} + {formatScore(parameters.texture)}) /
          4 = {formatScore(score)}
        </p>
      </div>
    </div>
  );
}
