"use client";

import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";

export function ScanPhoto({
  src,
  alt,
  scanning,
  guide = "circle",
  className,
}: {
  src: string;
  alt: string;
  scanning: boolean;
  guide?: "circle" | "none";
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <div className={clsx("relative aspect-square overflow-hidden rounded-[18px] bg-ink", className)}>
      <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 240px, 40vw" className="object-cover" unoptimized />
      {guide === "circle" && <span aria-hidden className="absolute inset-[16%] rounded-full border-2 border-dashed border-white/85" />}
      <AnimatePresence>
        {scanning && (
          <motion.div
            key="scan"
            aria-hidden
            className="absolute inset-0 bg-ink/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {!reduceMotion && (
              <motion.span
                className="absolute inset-x-0 h-16 bg-[linear-gradient(to_bottom,transparent,rgb(242_181_58/0.55),transparent)]"
                initial={{ top: "-25%" }}
                animate={{ top: "100%" }}
                transition={{ duration: 0.9, ease: "easeInOut", repeat: Infinity }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
