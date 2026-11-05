import { GradeStamp } from "@/components/ui/grade-stamp";
import { Avatar } from "@/components/ui/surface";
import type { BatchContribution } from "@/data/queries/batches";
import { formatClock, formatKg } from "@/lib/format";

export function ContributionList({ contributions }: { contributions: BatchContribution[] }) {
  if (contributions.length === 0) {
    return <p className="py-4 text-ink-2">Belum ada ikan di pesanan ini.</p>;
  }
  return (
    <ul>
      {contributions.map((contribution) => (
        <li
          key={contribution.landing.id}
          className="flex min-h-[4.25rem] items-center gap-3 border-b border-line py-2.5 last:border-b-0"
        >
          <Avatar initials={contribution.fisher.initials} size="sm" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="font-bold">Pak {contribution.fisher.name}</span>
            <span className="text-ink-2">
              Darat {formatClock(contribution.landing.landedAt)} · {contribution.landing.iced ? "pakai es" : "tanpa es"}
            </span>
          </div>
          <GradeStamp grade={contribution.grading.grade} size="sm" />
          <span className="type-num-m w-[4.75rem] shrink-0 text-right">{formatKg(contribution.kg)}</span>
        </li>
      ))}
    </ul>
  );
}
