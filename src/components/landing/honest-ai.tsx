"use client";

import { Icon, type IconName } from "@/components/icons/icon";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { SimulatedTag } from "@/components/ui/surface";
import { GradeStamp } from "@/components/ui/grade-stamp";
import {
  finalScore,
  gradeFromParameters,
  type ParameterScores,
} from "@/domain/freshness-score";
import { formatScore } from "@/lib/format";

const EXAMPLE: ParameterScores = { eye: 8.6, gill: 8.1, odor: 9, texture: 7 };
const EXAMPLE_SCORE = finalScore(EXAMPLE);
const EXAMPLE_GRADE = gradeFromParameters(EXAMPLE, "sea_fresh");

const ROWS: Array<{
  label: string;
  key: keyof ParameterScores;
  by: "AI" | "manusia";
}> = [
  { label: "Mata", key: "eye", by: "AI" },
  { label: "Insang", key: "gill", by: "AI" },
  { label: "Bau", key: "odor", by: "manusia" },
  { label: "Tekstur", key: "texture", by: "manusia" },
];

const POINTS: Array<{ icon: IconName; text: string }> = [
  {
    icon: "savedOnDevice",
    text: "Demo berjalan di browser. Model terlatih belum dipasang; foto unggahan dinilai manual.",
  },
  {
    icon: "eye",
    text: "Empat parameter dicatat: mata, insang, bau, dan tekstur. Bau serta tekstur selalu dinilai manusia.",
  },
  {
    icon: "edit",
    text: "Operator bisa mengubah mutu dengan alasan. Setiap perubahan tercatat.",
  },
];

function ScoreCard() {
  return (
    <div className="weighing-docket flex flex-col gap-5 p-6 sm:p-8">
      <p className="flex items-center gap-2 text-ink-2">
        Contoh hasil penilaian <SimulatedTag />
      </p>
      <div className="flex items-center gap-5">
        <GradeStamp grade={EXAMPLE_GRADE} size="lg" />
        <div className="flex flex-col gap-1">
          <p className="flex items-baseline gap-2">
            <span className="type-num-xl">{formatScore(EXAMPLE_SCORE)}</span>
            <span className="text-ink-2">dari 9</span>
          </p>
          <p className="text-ink-2">Dinilai 4 dari 6 hal</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 border-t border-line pt-5">
        {ROWS.map((row) => (
          <div
            key={row.key}
            className="grid grid-cols-[3.5rem_minmax(0,1fr)_2rem] items-center gap-x-3 gap-y-1"
          >
            <span className="font-semibold">{row.label}</span>
            <span className="h-2.5 overflow-hidden rounded-full bg-paper-deep">
              <span
                className="block h-full bg-ink"
                style={{ width: `${(EXAMPLE[row.key] / 9) * 100}%` }}
              />
            </span>
            <span className="tabular text-right font-semibold">
              {formatScore(EXAMPLE[row.key])}
            </span>
            <span className="col-start-2 col-end-4 text-[0.875rem] text-ink-2">
              oleh {row.by === "AI" ? "model simulasi" : row.by}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HonestAi() {
  return (
    <section className="border-t border-line bg-paper-deep/40">
      <div className="mx-auto grid max-w-[76rem] grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
        <Reveal className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="type-eyebrow">AI yang bisa diperiksa</p>
            <h2 className="type-title">AI menyarankan, manusia memutuskan</h2>
          </div>
          <ul className="flex flex-col gap-4">
            {POINTS.map((point) => (
              <li key={point.text} className="flex gap-3.5">
                <span className="grid size-8 shrink-0 place-items-center">
                  <Icon name={point.icon} size={22} />
                </span>
                <span className="pt-1.5">{point.text}</span>
              </li>
            ))}
          </ul>
          <ButtonLink
            href="/tentang/model"
            variant="quiet"
            size="lg"
            iconAfter="arrowRight"
            className="self-start"
          >
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
