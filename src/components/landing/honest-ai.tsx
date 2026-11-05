"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { Icon, type IconName } from "@/components/icons/icon";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { finalScore, gradeFromParameters, type ParameterScores } from "@/domain/freshness-score";
import { formatScore } from "@/lib/format";

const EXAMPLE: ParameterScores = { eye: 8.6, gill: 8.1, odor: 9, texture: 7 };
const EXAMPLE_SCORE = finalScore(EXAMPLE);
const EXAMPLE_GRADE = gradeFromParameters(EXAMPLE, "sea_fresh");

const ROWS: Array<{ label: string; key: keyof ParameterScores; by: "AI" | "manusia" }> = [
  { label: "Mata", key: "eye", by: "AI" },
  { label: "Insang", key: "gill", by: "AI" },
  { label: "Bau", key: "odor", by: "manusia" },
  { label: "Tekstur", key: "texture", by: "manusia" },
];

const POINTS: Array<{ icon: IconName; text: string }> = [
  { icon: "savedOnDevice", text: "Model jalan di browser, jadi tetap bisa dipakai tanpa sinyal di dermaga." },
  { icon: "eye", text: "AI menilai mata dan insang. Bau dan tekstur dinilai manusia: 4 dari 6 hal dalam SNI 2729." },
  { icon: "edit", text: "Operator bisa mengubah mutu dengan alasan. Setiap perubahan tercatat." },
];

function ScoreCard() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  return (
    <div ref={ref} className="flex flex-col gap-5 rounded-[24px] border border-line bg-surface p-6 shadow-raised sm:p-7">
      <div className="flex items-center gap-5">
        {inView ? <GradeStamp grade={EXAMPLE_GRADE} size="lg" pressIn /> : <span className="size-[6.5rem]" aria-hidden />}
        <div className="flex flex-col gap-1">
          <p className="flex items-baseline gap-2">
            <span className="type-num-xl">{formatScore(EXAMPLE_SCORE)}</span>
            <span className="text-ink-2">dari 9</span>
          </p>
          <p className="text-ink-2">Dinilai 4 dari 6 hal</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 border-t border-line pt-5">
        {ROWS.map((row, index) => (
          <div key={row.key} className="grid grid-cols-[4.5rem_1fr_2.25rem_6.25rem] items-center gap-3">
            <span className="font-semibold">{row.label}</span>
            <span className="h-2.5 overflow-hidden rounded-full bg-paper-deep">
              <motion.span
                className="block h-full rounded-full bg-ink"
                initial={reduceMotion ? false : { width: 0 }}
                animate={inView ? { width: `${(EXAMPLE[row.key] / 9) * 100}%` } : undefined}
                transition={{ duration: 0.8, ease: [0.22, 0.8, 0.24, 1], delay: 0.25 + index * 0.1 }}
              />
            </span>
            <span className="tabular text-right font-bold">{formatScore(EXAMPLE[row.key])}</span>
            <span className="text-[0.9375rem] text-ink-2">oleh {row.by}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HonestAi() {
  return (
    <section className="bg-paper-deep/60">
      <div className="mx-auto grid max-w-[76rem] items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
        <Reveal className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="type-eyebrow">AI yang bisa diperiksa</p>
            <h2 className="type-title">AI menyarankan, manusia memutuskan</h2>
          </div>
          <ul className="flex flex-col gap-4">
            {POINTS.map((point) => (
              <li key={point.text} className="flex gap-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-[12px] border border-line bg-surface">
                  <Icon name={point.icon} size={22} />
                </span>
                <span className="pt-1.5">{point.text}</span>
              </li>
            ))}
          </ul>
          <ButtonLink href="/tentang/model" variant="quiet" size="lg" iconAfter="arrowRight" className="self-start">
            Cara AI menilai, termasuk batasannya
          </ButtonLink>
        </Reveal>
        <Reveal delay={0.1}>
          <ScoreCard />
        </Reveal>
      </div>
    </section>
  );
}
