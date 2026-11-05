import clsx from "clsx";
import Image from "next/image";
import { Icon } from "@/components/icons/icon";
import { ButtonLink } from "@/components/ui/button";
import { GradeStamp } from "@/components/ui/grade-stamp";
import {
  finalScore,
  gradeFromParameters,
  type ParameterScores,
} from "@/domain/freshness-score";
import { GRADE_MEANING } from "@/content/labels";
import { formatScore } from "@/lib/format";

const EXAMPLE: ParameterScores = { eye: 8.6, gill: 8.1, odor: 9, texture: 7 };
const EXAMPLE_SCORE = finalScore(EXAMPLE);
const EXAMPLE_GRADE = gradeFromParameters(EXAMPLE, "sea_fresh");

type Source = "model" | "manusia";

const SIDES: Array<{
  source: Source;
  title: string;
  rows: Array<{ label: string; key: keyof ParameterScores; how: string }>;
}> = [
  {
    source: "model",
    title: "Disarankan model",
    rows: [
      { label: "Mata", key: "eye", how: "dari foto mata" },
      { label: "Insang", key: "gill", how: "dari foto insang" },
    ],
  },
  {
    source: "manusia",
    title: "Dinilai manusia",
    rows: [
      { label: "Bau", key: "odor", how: "dicium operator" },
      { label: "Tekstur", key: "texture", how: "ditekan operator" },
    ],
  },
];

/* Kartu parameter yang menempel di lintasan sonar */
function ParameterCard({
  label,
  score,
  how,
  source,
  className,
}: {
  label: string;
  score: number;
  how: string;
  source: Source;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-2 rounded-[20px] bg-surface p-4 text-ink shadow-floating sm:p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold">{label}</p>
        <span
          className={clsx(
            "rounded-full px-2 py-0.5 text-xs font-semibold",
            source === "model"
              ? "bg-sky-tint text-sea-deep"
              : "bg-gold-tint text-gold-deep",
          )}
        >
          {source}
        </span>
      </div>
      <p className="flex items-baseline gap-1">
        <span className="type-money text-[1.75rem] sm:text-[2rem]">
          {formatScore(score)}
        </span>
        <span className="text-sm text-ink-2">/ 9</span>
      </p>
      <span aria-hidden className="h-1.5 overflow-hidden rounded-full bg-paper-deep">
        <span
          className={clsx(
            "block h-full rounded-full",
            source === "model" ? "bg-sea" : "bg-gold",
          )}
          style={{ width: `${(score / 9) * 100}%` }}
        />
      </span>
      <p className="text-sm text-ink-2">{how}</p>
    </div>
  );
}

/* Lingkar sonar: alat yang akrab di kapal, di sini mengelilingi mata ikan yang dibaca model */
function SonarRings({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1000 620"
      preserveAspectRatio="xMidYMid meet"
      className={clsx("pointer-events-none text-white", className)}
    >
      <g fill="none" stroke="currentColor">
        <ellipse cx="500" cy="310" rx="150" ry="150" strokeOpacity="0.18" />
        <ellipse cx="500" cy="310" rx="250" ry="205" strokeOpacity="0.13" strokeDasharray="3 9" />
        <ellipse cx="500" cy="310" rx="370" ry="255" strokeOpacity="0.1" />
        <ellipse cx="500" cy="310" rx="490" ry="300" strokeOpacity="0.08" strokeDasharray="2 10" />
        <line x1="500" y1="0" x2="500" y2="620" strokeOpacity="0.06" />
        <line x1="0" y1="310" x2="1000" y2="310" strokeOpacity="0.06" />
      </g>
      <g fill="currentColor">
        <circle cx="250" cy="310" r="3" fillOpacity="0.4" />
        <circle cx="750" cy="310" r="3" fillOpacity="0.4" />
        <circle cx="500" cy="105" r="3" fillOpacity="0.4" />
        <circle cx="160" cy="205" r="2.5" fillOpacity="0.28" />
        <circle cx="840" cy="415" r="2.5" fillOpacity="0.28" />
      </g>
    </svg>
  );
}

function EyeTarget({ className }: { className?: string }) {
  return (
    <figure className={clsx("relative flex flex-col items-center", className)}>
      <div className="relative size-40 rounded-full p-2 ring-1 ring-white/15 sm:size-48 lg:size-56">
        <SonarRings className="absolute left-1/2 top-1/2 -z-10 w-[36rem] -translate-x-1/2 -translate-y-1/2 sm:w-[46rem] lg:w-[68rem]" />
        <div className="relative size-full overflow-hidden rounded-full">
          <Image
            src="/samples/ffe/kembung-mata-sangat-segar-2.jpg"
            alt="Foto contoh mata ikan kembung yang dibaca model"
            fill
            unoptimized
            sizes="224px"
            className="object-cover"
          />
          <span
            aria-hidden
            className="absolute inset-[18%] rounded-full border-2 border-dashed border-white/85"
          />
        </div>
      </div>
      <figcaption className="mt-3 text-center text-sm text-white/60">
        Foto mata, contoh dataset FFE
      </figcaption>
    </figure>
  );
}

export function HonestAi() {
  return (
    <section className="px-3 pb-16 sm:px-5 lg:px-6 lg:pb-24">
      <div className="relative isolate mx-auto max-w-[84rem] overflow-hidden rounded-[32px] bg-ink px-4 py-14 text-white sm:px-10 lg:rounded-[40px] lg:px-16 lg:py-20">
        <header className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="type-title">AI menyarankan, manusia memutuskan</h2>
          <p className="max-w-[34rem] text-white/75 lg:text-lg">
            Model membaca foto mata dan insang. Bau dan tekstur selalu dinilai
            orang di dermaga. Operator memegang keputusan akhir.
          </p>
        </header>

        <div className="relative mx-auto mt-10 max-w-[64rem] lg:mt-14">

          <div className="relative grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-10">
            <EyeTarget className="col-span-2 mb-6 lg:order-2 lg:col-span-1 lg:mb-0" />
            {SIDES.map((side, sideIndex) => (
              <div
                key={side.source}
                className={clsx(
                  "flex min-w-0 flex-col gap-3 sm:gap-4",
                  sideIndex === 0 ? "lg:order-1" : "lg:order-3",
                )}
              >
                <p
                  className={clsx(
                    "flex items-center gap-2 text-sm font-semibold",
                    sideIndex === 0
                      ? "text-sky lg:justify-end"
                      : "text-gold",
                  )}
                >
                  <Icon name={sideIndex === 0 ? "eye" : "hand"} size={16} />
                  {side.title}
                </p>
                {side.rows.map((row, rowIndex) => (
                  <ParameterCard
                    key={row.key}
                    label={row.label}
                    score={EXAMPLE[row.key]}
                    how={row.how}
                    source={side.source}
                    className={clsx(
                      "lg:w-[15rem]",
                      sideIndex === 0 ? "lg:self-end" : "lg:self-start",
                      rowIndex === 0 &&
                        (sideIndex === 0 ? "lg:-mr-6" : "lg:-ml-6"),
                      rowIndex === 1 &&
                        (sideIndex === 0 ? "lg:mr-10" : "lg:ml-10"),
                    )}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="relative mx-auto mt-6 flex max-w-[30rem] flex-col gap-4 rounded-[24px] bg-surface p-5 text-ink shadow-floating sm:p-6 lg:mt-10">
            <div className="flex items-center gap-4 sm:gap-5">
              <GradeStamp grade={EXAMPLE_GRADE} size="lg" />
              <div className="flex min-w-0 flex-col gap-1">
                <p className="text-sm font-semibold text-ink-2">
                  Keputusan operator
                </p>
                <p className="flex items-baseline gap-2">
                  <span className="type-num-xl">
                    {formatScore(EXAMPLE_SCORE)}
                  </span>
                  <span className="text-ink-2">dari 9</span>
                </p>
                <p className="text-sm text-ink-2">
                  {GRADE_MEANING[EXAMPLE_GRADE]}
                </p>
              </div>
            </div>
            <p className="flex items-start gap-2.5 rounded-[16px] bg-paper px-4 py-3 text-sm">
              <Icon name="edit" size={18} className="mt-0.5 shrink-0 text-sea" />
              Operator bisa mengubah mutu dengan alasan. Setiap perubahan
              tercatat.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-5 text-center lg:mt-12">
          <p className="flex max-w-xl items-start gap-2 text-sm text-white/65">
            <Icon name="savedOnDevice" size={18} className="mt-0.5 shrink-0" />
            Contoh angka simulasi. Demo berjalan di browser; model terlatih
            belum dipasang dan foto unggahan dinilai manual.
          </p>
          <ButtonLink href="/tentang/model" variant="inverted" size="lg">
            Cara AI menilai, termasuk batasannya
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
