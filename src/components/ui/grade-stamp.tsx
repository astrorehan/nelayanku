"use client";

import clsx from "clsx";
import { motion, useReducedMotion } from "motion/react";
import type { Grade } from "@/domain/grade";
import { Icon } from "@/components/icons/icon";
import { GRADE_LABEL } from "@/content/labels";

const GRADE_LOOK: Record<Grade, string> = {
  A: "text-grade-a-ink bg-grade-a-tint",
  B: "text-grade-b-ink bg-grade-b-tint",
  C: "text-grade-c-ink bg-grade-c-tint",
  REJECT: "text-grade-reject-ink bg-grade-reject-tint",
};

const SIZES = {
  sm: { box: "size-9 rounded-[9px] border-2", letter: "text-lg", label: "hidden", iconSize: 18 },
  md: { box: "size-14 rounded-[12px] border-[2.5px]", letter: "text-2xl", label: "text-[0.5625rem] mt-0.5", iconSize: 24 },
  lg: { box: "size-[6.5rem] rounded-[18px] border-[3.5px]", letter: "text-5xl", label: "text-[0.8125rem] mt-1", iconSize: 44 },
} as const;

export function GradeStamp({
  grade,
  size = "md",
  pressIn = false,
  className,
}: {
  grade: Grade;
  size?: keyof typeof SIZES;
  pressIn?: boolean;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const look = SIZES[size];
  const tilt = size === "sm" ? 0 : -3;
  const animateIn = pressIn && !reduceMotion;
  return (
    <motion.span
      role="img"
      aria-label={`Grade ${grade === "REJECT" ? "tolak" : grade}, ${GRADE_LABEL[grade]}`}
      initial={animateIn ? { scale: 1.65, rotate: -16, opacity: 0 } : false}
      animate={{ scale: 1, rotate: tilt, opacity: 1 }}
      transition={{ type: "spring", stiffness: 520, damping: 21, mass: 0.9 }}
      className={clsx(
        "relative inline-flex shrink-0 flex-col items-center justify-center border-current font-extrabold leading-none",
        "shadow-[inset_0_0_0_2px_var(--color-surface),inset_0_0_0_3px_currentColor]",
        GRADE_LOOK[grade],
        look.box,
        className,
      )}
    >
      {grade === "REJECT" ? (
        <Icon name="close" size={look.iconSize} strokeWidth={3} />
      ) : (
        <span className={clsx("font-[family-name:var(--font-display)]", look.letter)}>{grade}</span>
      )}
      <span className={clsx("font-bold uppercase tracking-[0.12em]", look.label)}>{GRADE_LABEL[grade]}</span>
      {animateIn && (
        <motion.span
          aria-hidden
          initial={{ opacity: 0.45, scale: 0.9 }}
          animate={{ opacity: 0, scale: 1.55 }}
          transition={{ duration: 0.55, ease: [0.22, 0.8, 0.24, 1], delay: 0.08 }}
          className="pointer-events-none absolute inset-0 rounded-[inherit] border-2 border-current"
        />
      )}
    </motion.span>
  );
}
