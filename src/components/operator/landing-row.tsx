import { GradeStamp } from "@/components/ui/grade-stamp";
import type { LandingView } from "@/data/queries/landings";
import { formatClock, formatDecimal } from "@/lib/format";

export function LandingRow({ view }: { view: LandingView }) {
  return (
    <li className="grid min-h-20 grid-cols-[3.25rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-line py-4 last:border-b-0">
      <time
        dateTime={view.landing.landedAt}
        className="type-code text-sm text-ink-2"
      >
        {formatClock(view.landing.landedAt)}
      </time>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-medium">Pak {view.fisher.name}</span>
        <span className="text-ink-2">
          {view.species.name}
          {!view.landing.iced && " · tanpa es"}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="tabular whitespace-nowrap text-lg font-medium">
          {formatDecimal(view.landing.weightKg)}
          <span className="ml-1 text-sm font-normal text-ink-2">kg</span>
        </span>
        {view.grading ? (
          <GradeStamp grade={view.grading.grade} size="sm" />
        ) : (
          <span className="text-sm text-warning-ink">
            Belum
            <br />
            dinilai
          </span>
        )}
      </div>
    </li>
  );
}
