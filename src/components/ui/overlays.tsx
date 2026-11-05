"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as Popover from "@radix-ui/react-popover";
import clsx from "clsx";
import type { ReactNode } from "react";
import { Icon } from "@/components/icons/icon";

export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  hideClose = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  hideClose?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="sheet-overlay fixed inset-0 z-40 bg-ink/40 backdrop-blur-[3px]" />
        <Dialog.Content
          className={clsx(
            "sheet-content fixed z-50 flex max-h-[92dvh] flex-col bg-surface text-ink shadow-floating focus:outline-none",
            "inset-x-0 bottom-0 rounded-t-[28px] pb-[max(1rem,env(safe-area-inset-bottom))]",
            "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[min(32rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[28px] sm:pb-0",
          )}
        >
          <div className="flex items-start gap-3 px-5 pb-2 pt-5 sm:px-6 sm:pt-6">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Dialog.Title className="type-h2">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="text-ink-2">{description}</Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">{title}</Dialog.Description>
              )}
            </div>
            {!hideClose && (
              <Dialog.Close className="inline-flex min-h-12 shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-4 font-semibold hover:border-line-strong hover:bg-paper">
                <Icon name="close" size={18} />
                Tutup
              </Dialog.Close>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-2 sm:px-6">{children}</div>
          {footer && <div className="border-t border-line px-5 pt-4 sm:px-6 sm:pb-6">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function WhyPopover({ label = "Dari mana angka ini?", title, children }: { label?: string; title: ReactNode; children: ReactNode }) {
  return (
    <Popover.Root>
      <Popover.Trigger
        className="inline-flex min-h-11 items-center gap-1.5 rounded-[10px] px-2 text-[0.9375rem] font-semibold text-ink-2 underline decoration-dotted underline-offset-4 hover:text-ink"
        aria-label={label}
      >
        <Icon name="help" size={18} />
        <span className="sr-only sm:not-sr-only">{label}</span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          collisionPadding={16}
          className="popover-content z-50 w-[min(22rem,calc(100vw-2rem))] rounded-[20px] border border-line bg-surface p-4 text-ink shadow-floating"
        >
          <p className="mb-2 font-semibold">{title}</p>
          <div className="flex flex-col gap-2 leading-snug text-ink-2">{children}</div>
          <Popover.Arrow className="fill-surface" width={16} height={8} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
