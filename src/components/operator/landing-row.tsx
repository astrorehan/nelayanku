import { GradeStamp } from "@/components/ui/grade-stamp";
import { Avatar, Pill } from "@/components/ui/surface";
import type { LandingView } from "@/data/queries/landings";
import { formatClock, formatKg } from "@/lib/format";

export function LandingRow({ view }: { view: LandingView }) {
  return (
    <li className="flex min-h-[4.25rem] items-center gap-3 border-b border-line py-2.5 last:border-b-0">
      <Avatar initials={view.fisher.initials} size="sm" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-semibold">Pak {view.fisher.name}</span>
        <span className="text-ink-2">
          {view.species.name} · {formatKg(view.landing.weightKg)} · {formatClock(view.landing.landedAt)}
          {!view.landing.iced && " · tanpa es"}
        </span>
      </div>
      {view.grading ? <GradeStamp grade={view.grading.grade} size="sm" /> : <Pill tone="warning">Belum dinilai</Pill>}
    </li>
  );
}
