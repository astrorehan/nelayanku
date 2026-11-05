"use client";

import clsx from "clsx";
import { animate, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import type { FreshClockStatus } from "@/domain/cold-chain";
import { formatDuration } from "@/lib/format";

const SPRING = { type: "spring", stiffness: 140, damping: 22, mass: 0.9 } as const;

export function FillMeter({
  filled,
  target,
  incoming = 0,
  size = "md",
  label,
  className,
}: {
  filled: number;
  target: number;
  incoming?: number;
  size?: "md" | "lg";
  label: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const filledShare = Math.min(1, filled / target);
  const incomingShare = Math.max(0, Math.min(1 - filledShare, incoming / target));
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={target}
      aria-valuenow={Math.min(target, filled + incoming)}
      className={clsx(
        "relative w-full overflow-hidden rounded-full border border-line bg-paper-deep",
        size === "lg" ? "h-5" : "h-3.5",
        className,
      )}
    >
      <motion.span
        className="absolute inset-y-0 left-0 rounded-full bg-ink"
        initial={reduceMotion ? false : { width: 0 }}
        animate={{ width: `${filledShare * 100}%` }}
        transition={reduceMotion ? { duration: 0 } : SPRING}
      />
      {incomingShare > 0 && (
        <motion.span
          className="absolute inset-y-0 rounded-r-full bg-[repeating-linear-gradient(-45deg,var(--color-gold)_0_6px,#f7d27f_6px_12px)]"
          style={{ left: `${filledShare * 100}%` }}
          initial={reduceMotion ? false : { width: 0 }}
          animate={{ width: `${incomingShare * 100}%` }}
          transition={reduceMotion ? { duration: 0 } : { ...SPRING, delay: 0.15 }}
        />
      )}
    </div>
  );
}

const CLOCK_TONE: Record<FreshClockStatus, string> = {
  safe: "text-grade-a",
  soon: "text-[#c98a0a]",
  expired: "text-danger",
};

export function FreshClock({
  remainingMinutes,
  totalMinutes,
  status,
  size = 64,
}: {
  remainingMinutes: number;
  totalMinutes: number;
  status: FreshClockStatus;
  size?: number;
}) {
  const reduceMotion = useReducedMotion();
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const share = Math.max(0, Math.min(1, remainingMinutes / totalMinutes));
  return (
    <span className={clsx("relative inline-grid shrink-0 place-items-center", CLOCK_TONE[status])} style={{ width: size, height: size }}>
      <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden className="-rotate-90">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="var(--color-paper-deep)" strokeWidth="7" />
        <motion.circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={reduceMotion ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - share) }}
          transition={reduceMotion ? { duration: 0 } : { duration: 1.1, ease: [0.22, 0.8, 0.24, 1] }}
        />
      </svg>
      <span className="sr-only">Sisa waktu segar {formatDuration(remainingMinutes)}</span>
    </span>
  );
}

export function CountUp({
  value,
  format,
  className,
  durationSeconds = 0.9,
}: {
  value: number;
  format: (value: number) => string;
  className?: string;
  durationSeconds?: number;
}) {
  const reduceMotion = useReducedMotion();
  const output = useRef<HTMLSpanElement>(null);
  const previous = useRef(0);
  useEffect(() => {
    const element = output.current;
    if (!element) {
      return;
    }
    if (reduceMotion) {
      element.textContent = format(value);
      previous.current = value;
      return;
    }
    const controls = animate(previous.current, value, {
      duration: durationSeconds,
      ease: [0.22, 0.8, 0.24, 1],
      onUpdate: (latest) => {
        element.textContent = format(latest);
      },
    });
    previous.current = value;
    return () => controls.stop();
  }, [value, format, reduceMotion, durationSeconds]);
  return (
    <span ref={output} className={clsx("tabular", className)}>
      {format(value)}
    </span>
  );
}
