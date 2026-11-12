import Link from "next/link";
import { Icon } from "@/components/icons/icon";
import { GradeStamp } from "@/components/ui/grade-stamp";
import type { LandingView } from "@/data/queries/landings";
import { formatClock, formatDecimal, formatShortDate } from "@/lib/format";

/**
 * One landing in a list. Graded landings open their detail page; a landing that is still
 * waiting for a grade opens the grading wizard so it can be finished.
 */
export function LandingRow({ view, showDate = false, showFisher = true }: { view: LandingView; showDate?: boolean; showFisher?: boolean }) {
  const pending = view.grading === null && view.landing.destination === null;
  const href = pending ? `/kub/darat?pendaratan=${view.landing.id}` : `/kub/pendaratan/${view.landing.id}`;
  return (
    <li className="border-b border-line last:border-b-0">
      <Link
        href={href}
        className="group grid min-h-20 grid-cols-[3.25rem_minmax(0,1fr)_auto] items-center gap-3 py-4 hover:bg-paper"
      >
        <time dateTime={view.landing.landedAt} className="tabular text-sm font-semibold leading-snug text-ink-3">
          {showDate && (
            <>
              {formatShortDate(view.landing.landedAt)}
              <br />
            </>
          )}
          {formatClock(view.landing.landedAt)}
        </time>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-medium">{showFisher ? `Pak ${view.fisher.name}` : view.species.name}</span>
          <span className="text-ink-2">
            {showFisher && view.species.name}
            {showFisher && !view.landing.iced && " · "}
            {!view.landing.iced && "tanpa es"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="type-money whitespace-nowrap text-lg">
            {formatDecimal(view.landing.weightKg)}
            <span className="ml-1 text-sm font-normal text-ink-2">kg</span>
          </span>
          {view.grading ? (
            <GradeStamp grade={view.grading.grade} size="sm" />
          ) : (
            <span className="rounded-full bg-gold-tint px-2.5 py-1 text-xs font-semibold leading-tight text-warning-ink">
              Belum dinilai
            </span>
          )}
          <Icon name="chevronRight" size={18} className="hidden text-ink-3 group-hover:text-ink sm:block" />
        </div>
      </Link>
    </li>
  );
}
