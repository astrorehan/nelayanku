import clsx from "clsx";
import { Icon } from "@/components/icons/icon";
import type { TimelineState, TimelineStep } from "@/data/queries/tracking";
import { formatClock, formatShortDate } from "@/lib/format";

const MARKER: Record<TimelineState, string> = {
  done: "bg-sea text-white",
  current: "border-2 border-sea bg-sky-tint text-sea",
  pending: "border-2 border-line bg-surface text-ink-3",
  failed: "bg-danger text-white",
};

const STATE_TEXT: Record<TimelineState, string> = {
  done: "selesai",
  current: "tahap sekarang",
  pending: "belum",
  failed: "tidak berlanjut",
};

function Marker({ state, number }: { state: TimelineState; number: number }) {
  return (
    <span
      aria-hidden
      className={clsx(
        "relative z-10 grid size-10 shrink-0 place-items-center rounded-full font-semibold",
        MARKER[state],
      )}
    >
      {state === "done" && <Icon name="check" size={20} strokeWidth={3} />}
      {state === "failed" && <Icon name="close" size={20} strokeWidth={3} />}
      {state === "current" && <Icon name="dot" size={20} />}
      {state === "pending" && <span className="tabular text-[0.9375rem]">{number}</span>}
    </span>
  );
}

export function TraceTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="grid lg:grid-cols-5">
      {steps.map((step, index) => {
        const next = steps[index + 1];
        const reached = step.state === "done" && next && next.state !== "pending";
        return (
          <li
            key={step.id}
            aria-current={step.state === "current" ? "step" : undefined}
            className="relative flex gap-4 pb-7 last:pb-0 lg:flex-col lg:gap-3 lg:pb-0 lg:pr-4"
          >
            {next && (
              <span
                aria-hidden
                className={clsx(
                  "absolute bottom-1 left-5 top-11 w-0.5 -translate-x-1/2 lg:bottom-auto lg:left-[3.25rem] lg:right-1 lg:top-5 lg:h-0.5 lg:w-auto lg:translate-x-0 lg:-translate-y-1/2",
                  reached ? "bg-sea" : "bg-line",
                )}
              />
            )}
            <Marker state={step.state} number={index + 1} />
            <div className="flex min-w-0 flex-col gap-0.5 pt-1.5 lg:pt-0">
              <p
                className={clsx(
                  "font-semibold leading-snug",
                  step.state === "failed" && "text-danger-ink",
                  step.state === "pending" && "text-ink-2",
                )}
              >
                {step.label}
                <span className="sr-only">, {STATE_TEXT[step.state]}</span>
              </p>
              {step.at && (
                <p className="tabular text-ink-2">
                  {formatClock(step.at)} WIB · {formatShortDate(step.at)}
                </p>
              )}
              <p className="text-[0.9375rem] leading-snug text-ink-2">{step.detail}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
