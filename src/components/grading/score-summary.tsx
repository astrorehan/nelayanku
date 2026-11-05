"use client";

import clsx from "clsx";
import { motion, useReducedMotion } from "motion/react";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { CountUp } from "@/components/ui/meters";
import { ASSESSED_PARAMETER_COUNT, SNI_PARAMETER_COUNT, type ParameterScores } from "@/domain/freshness-score";
import type { Grade } from "@/domain/grade";
import { GRADE_MEANING } from "@/content/labels";
import { formatScore } from "@/lib/format";

export type ParameterSource = "AI" | "manusia";

const PARAMETERS: Array<{ key: keyof ParameterScores; label: string }> = [
  { key: "eye", label: "Mata" },
  { key: "gill", label: "Insang" },
  { key: "odor", label: "Bau" },
  { key: "texture", label: "Tekstur" },
];

export function ScoreHeadline({
  grade,
  finalScore,
  stampKey,
  size = "lg",
}: {
  grade: Grade;
  finalScore: number;
  stampKey: string;
  size?: "md" | "lg";
}) {
  return (
    <div className="flex items-center gap-4 sm:gap-5">
      <GradeStamp key={stampKey} grade={grade} size={size} pressIn />
      <div className="flex min-w-0 flex-col gap-1">
        <p className="flex items-baseline gap-2">
          <CountUp value={finalScore} format={formatScore} className={size === "lg" ? "type-num-xl" : "type-num-l"} />
          <span className="text-ink-2">dari 9</span>
        </p>
        <p className="font-bold leading-snug">{GRADE_MEANING[grade]}</p>
        <p className="text-ink-2">
          Dinilai {ASSESSED_PARAMETER_COUNT} dari {SNI_PARAMETER_COUNT} hal dalam SNI 2729
        </p>
      </div>
    </div>
  );
}

export function ParameterBars({
  parameters,
  sources,
  notes,
  className,
}: {
  parameters: ParameterScores;
  sources: Record<keyof ParameterScores, ParameterSource>;
  notes?: Partial<Record<keyof ParameterScores, string>>;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <dl className={clsx("flex flex-col gap-3", className)}>
      {PARAMETERS.map(({ key, label }) => (
        <div key={key} className="grid grid-cols-[4.25rem_1fr_2.5rem] items-center gap-x-3 gap-y-1">
          <dt className="font-bold">{label}</dt>
          <dd className="contents">
            <span className="h-2.5 overflow-hidden rounded-full bg-paper-deep">
              <motion.span
                className={clsx("block h-full rounded-full", parameters[key] < 7 ? "bg-grade-c" : "bg-ink")}
                initial={reduceMotion ? false : { width: 0 }}
                animate={{ width: `${(parameters[key] / 9) * 100}%` }}
                transition={{ type: "spring", stiffness: 160, damping: 24 }}
              />
            </span>
            <span className="tabular text-right font-bold">{formatScore(parameters[key])}</span>
            <span className="col-start-2 col-end-4 text-[0.9375rem] leading-snug text-ink-2">
              oleh {sources[key]}
              {notes?.[key] ? ` · ${notes[key]}` : ""}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
