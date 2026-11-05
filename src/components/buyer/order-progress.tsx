import clsx from "clsx";
import type { BatchStatus } from "@/data/types";

const STEPS = ["Dipesan", "Diisi", "Dikirim", "Diterima"] as const;

const PROGRESS: Record<BatchStatus, { done: number; current: number | null }> = {
  filling: { done: 1, current: 1 },
  full: { done: 2, current: null },
  labelled: { done: 2, current: null },
  in_transit: { done: 2, current: 2 },
  received: { done: 4, current: null },
  rejected: { done: 3, current: null },
  cancelled: { done: 1, current: null },
};

export function OrderProgress({ status }: { status: BatchStatus }) {
  const { done, current } = PROGRESS[status];
  return (
    <ol className="grid grid-cols-4 gap-1.5" aria-label="Tahap pesanan">
      {STEPS.map((step, index) => {
        const isDone = index < done;
        const isCurrent = index === current;
        return (
          <li key={step} className="flex flex-col gap-1.5" aria-current={isCurrent ? "step" : undefined}>
            <span
              className={clsx(
                "relative h-1.5 overflow-hidden rounded-full",
                isDone ? "bg-sea" : "bg-paper-deep",
                isCurrent && "bg-[repeating-linear-gradient(-45deg,var(--color-gold)_0_6px,#f7d27f_6px_12px)]",
              )}
            />
            <span className={clsx("text-[0.875rem] leading-tight", isDone || isCurrent ? "font-semibold text-ink" : "text-ink-2")}>
              {step}
              <span className="sr-only">{isDone ? ", selesai" : isCurrent ? ", sedang berjalan" : ""}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
