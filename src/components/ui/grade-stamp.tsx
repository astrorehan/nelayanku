"use client";

import clsx from "clsx";
import { motion, useReducedMotion } from "motion/react";
import type { Grade } from "@/domain/grade";
import { Icon } from "@/components/icons/icon";
import { GRADE_LABEL } from "@/content/labels";

const GRADE_LOOK: Record<Grade, string> = {
  A: "bg-grade-a text-grade-a-on border-grade-a",
  B: "bg-grade-b text-grade-b-on border-grade-b-ink",
  C: "bg-grade-c text-grade-c-on border-grade-c-ink",
  REJECT: "bg-grade-reject text-grade-reject-on border-grade-reject",
};

const SIZES = {
  sm: {
    box: "size-9 rounded-[8px] border",
    letter: "text-lg",
    label: "hidden",
    iconSize: 18,
  },
  md: {
    box: "size-14 rounded-[12px] border",
    letter: "text-2xl",
    label: "text-[0.6875rem] mt-0.5",
    iconSize: 24,
  },
  lg: {
    box: "size-24 rounded-[20px] border",
    letter: "text-5xl",
    label: "text-[0.8125rem] mt-1",
    iconSize: 44,
  },
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
  const animateIn = pressIn && !reduceMotion;
  return (
    <motion.span
      role="img"
      aria-label={
        grade === "REJECT"
          ? "Mutu tolak"
          : `Mutu ${grade}, ${GRADE_LABEL[grade]}`
      }
      initial={animateIn ? { opacity: 0, y: 4 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className={clsx(
        "relative inline-flex shrink-0 flex-col items-center justify-center font-hull font-bold leading-none",
        GRADE_LOOK[grade],
        look.box,
        className,
      )}
    >
      {grade === "REJECT" ? (
        <Icon name="close" size={look.iconSize} strokeWidth={3} />
      ) : (
        <span className={look.letter}>{grade}</span>
      )}
      <span className={clsx("font-medium", look.label)}>
        {GRADE_LABEL[grade]}
      </span>
    </motion.span>
  );
}
