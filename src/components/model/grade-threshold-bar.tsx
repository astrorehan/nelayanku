import clsx from "clsx";
import { GradeStamp } from "@/components/ui/grade-stamp";
import {
  PRIME_MINIMUM_FINAL_SCORE,
  PROCESSING_MINIMUM_FINAL_SCORE,
  SNI_MINIMUM_FINAL_SCORE,
} from "@/domain/freshness-score";
import type { Grade } from "@/domain/grade";
import { GRADE_LABEL } from "@/content/labels";
import { formatScore } from "@/lib/format";

const SCALE_MIN = 1;
const SCALE_MAX = 9;

const SEGMENTS: Array<{
  grade: Grade;
  from: number;
  to: number;
  look: string;
}> = [
  {
    grade: "REJECT",
    from: SCALE_MIN,
    to: PROCESSING_MINIMUM_FINAL_SCORE,
    look: "bg-grade-reject text-grade-reject-on",
  },
  {
    grade: "C",
    from: PROCESSING_MINIMUM_FINAL_SCORE,
    to: SNI_MINIMUM_FINAL_SCORE,
    look: "bg-grade-c text-grade-c-on",
  },
  {
    grade: "B",
    from: SNI_MINIMUM_FINAL_SCORE,
    to: PRIME_MINIMUM_FINAL_SCORE,
    look: "bg-grade-b text-grade-b-on",
  },
  {
    grade: "A",
    from: PRIME_MINIMUM_FINAL_SCORE,
    to: SCALE_MAX,
    look: "bg-grade-a text-grade-a-on",
  },
];

const TICKS = [
  SCALE_MIN,
  PROCESSING_MINIMUM_FINAL_SCORE,
  SNI_MINIMUM_FINAL_SCORE,
  PRIME_MINIMUM_FINAL_SCORE,
  SCALE_MAX,
];

function position(score: number): number {
  const clamped = Math.max(SCALE_MIN, Math.min(SCALE_MAX, score));
  return ((clamped - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
}

/* Skala skor 1 sampai 9 dengan empat zona mutu. Penanda hanya muncul bila skor diberikan. */
export function GradeThresholdBar({
  score,
  grade,
  className,
}: {
  score?: number;
  grade?: Grade;
  className?: string;
}) {
  return (
    <figure className={clsx("flex flex-col gap-2", className)}>
      <figcaption className="sr-only">
        Skala skor 1 sampai 9. Di bawah 5 tolak, 5 sampai 7 mutu C, 7 sampai 8
        mutu B, 8 ke atas mutu A bila tidak ada parameter di bawah 7.
      </figcaption>
      <div className="relative pt-9" aria-hidden>
        {score !== undefined && (
          <div
            className="absolute top-0 z-10 flex -translate-x-1/2 flex-col items-center"
            style={{ left: `${position(score)}%` }}
          >
            <span className="tabular rounded-full bg-ink px-2 py-0.5 text-xs font-semibold text-white">
              {formatScore(score)}
            </span>
            <span className="h-3 w-0.5 bg-ink" />
          </div>
        )}
        <div className="flex h-12 gap-0.5 overflow-hidden rounded-[12px]">
          {SEGMENTS.map((segment) => (
            <div
              key={segment.grade}
              style={{ flexGrow: segment.to - segment.from, flexBasis: 0 }}
              className={clsx(
                "flex min-w-0 items-center justify-center text-sm font-semibold",
                segment.look,
                grade !== undefined && grade !== segment.grade && "opacity-45",
              )}
            >
              {segment.grade === "REJECT" ? "Tolak" : segment.grade}
            </div>
          ))}
        </div>
        <div className="relative mt-1 h-5 text-xs text-ink-2">
          {TICKS.map((tick) => (
            <span
              key={tick}
              className={clsx(
                "tabular absolute",
                tick === SCALE_MAX
                  ? "-translate-x-full"
                  : tick === SCALE_MIN
                    ? ""
                    : "-translate-x-1/2",
              )}
              style={{ left: `${position(tick)}%` }}
            >
              {tick}
            </span>
          ))}
        </div>
      </div>
    </figure>
  );
}

const LEGEND: Array<{ grade: Grade; text: string }> = [
  {
    grade: "A",
    text: "Skor 8,0 ke atas, tanpa parameter di bawah 7. Untuk pesanan institusi.",
  },
  {
    grade: "B",
    text: "Skor 7,0 ke atas. Untuk pesanan yang sesuai mutu atau TPI.",
  },
  {
    grade: "C",
    text: "Skor 5,0 sampai di bawah 7,0. Perlu diperiksa ulang pengolah sebelum dipakai.",
  },
  {
    grade: "REJECT",
    text: "Skor di bawah 5,0 atau bau busuk. Tidak untuk konsumsi, termasuk olahan.",
  },
];

export function GradeThresholdLegend() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {LEGEND.map((item) => (
        <li key={item.grade} className="flex items-start gap-3">
          <GradeStamp grade={item.grade} size="sm" />
          <div className="min-w-0">
            <p className="font-medium">
              {item.grade === "REJECT"
                ? "Tolak"
                : `${item.grade} · ${GRADE_LABEL[item.grade]}`}
            </p>
            <p className="text-ink-2">{item.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
