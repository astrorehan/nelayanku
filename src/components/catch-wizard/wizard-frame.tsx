"use client";

import clsx from "clsx";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef, type ReactNode } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Stepper } from "@/components/ui/choices";

export const WIZARD_STEP_COUNT = 5;

export function StepHeading({ children, size = "h1" }: { children: ReactNode; size?: "h1" | "h2" }) {
  return (
    <h2 tabIndex={-1} data-step-heading className={clsx("outline-none", size === "h1" ? "type-h1" : "type-h2")}>
      {children}
    </h2>
  );
}

export function WizardFrame({
  step = 0,
  stepLabel,
  direction,
  onCancel,
  footer,
  children,
}: {
  step?: number;
  stepLabel?: string;
  direction: 1 | -1;
  onCancel?: () => void;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);
  const firstStep = useRef(step);
  const offset = reduceMotion ? 0 : 28 * direction;

  const focusStepHeading = () => {
    if (step !== firstStep.current) {
      contentRef.current?.querySelector<HTMLElement>("[data-step-heading]")?.focus({ preventScroll: true });
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 pb-3 pt-3 sm:px-6 lg:pt-6">
          <div className="flex items-center gap-3">
            <div className="flex min-w-0 flex-1 flex-col">
              <h1 className="text-lg font-semibold leading-tight">Catat pendaratan</h1>
              <p className="truncate text-ink-2">
                {stepLabel ? `Langkah ${step} dari ${WIZARD_STEP_COUNT} · ${stepLabel}` : "Menyiapkan…"}
              </p>
            </div>
            {onCancel ? (
              <Button variant="quiet" size="md" onClick={onCancel}>
                Batal
              </Button>
            ) : (
              <ButtonLink href="/kub" variant="quiet" size="md">
                Batal
              </ButtonLink>
            )}
          </div>
          <Stepper step={step} total={WIZARD_STEP_COUNT} label={`Langkah ${step} dari ${WIZARD_STEP_COUNT}`} />
        </div>
      </header>
      <main ref={contentRef} className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-8 pt-5 sm:px-6">
        <AnimatePresence mode="wait" initial={false} custom={direction} onExitComplete={() => window.scrollTo({ top: 0 })}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: offset }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -offset }}
            transition={{ duration: 0.22, ease: [0.22, 0.8, 0.24, 1] }}
            onAnimationComplete={focusStepHeading}
            className="flex flex-col gap-6"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      {footer && (
        <footer className="sticky bottom-0 z-20 border-t border-line bg-paper/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 px-4 sm:px-6">{footer}</div>
        </footer>
      )}
    </div>
  );
}

export function WizardFooter({
  hint,
  onBack,
  primary,
}: {
  hint?: string | null;
  onBack?: () => void;
  primary: ReactNode;
}) {
  return (
    <>
      <p aria-live="polite" className={clsx("text-center font-semibold text-ink-2", !hint && "sr-only")}>
        {hint}
      </p>
      <div className="flex gap-2">
        {onBack && (
          <Button variant="quiet" size="xl" onClick={onBack} className="px-5">
            Kembali
          </Button>
        )}
        <div className="flex-1 [&>*]:w-full">{primary}</div>
      </div>
    </>
  );
}
