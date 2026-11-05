import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons/icon";

type CardTone = "surface" | "paper" | "deep" | "ink";

const CARD_TONES: Record<CardTone, string> = {
  surface: "bg-surface border border-line",
  paper: "bg-paper border border-transparent",
  deep: "bg-sky-tint border border-transparent",
  ink: "bg-ink text-white border border-ink [--icon-signal:var(--color-gold)]",
};

export function Card({
  tone = "surface",
  emphasis = false,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { tone?: CardTone; emphasis?: boolean }) {
  return (
    <div
      className={clsx("rounded-[20px]", CARD_TONES[tone], emphasis && "border-2 border-sea", className)}
      {...rest}
    />
  );
}

export type NoticeTone = "info" | "warning" | "danger" | "success" | "neutral";

const NOTICE_TONES: Record<NoticeTone, { box: string; title: string; icon: IconName }> = {
  info: { box: "bg-info-tint border-info/70", title: "text-info-ink", icon: "info" },
  warning: { box: "bg-warning-tint border-[#efc65c]", title: "text-warning-ink", icon: "warning" },
  danger: { box: "bg-danger-tint border-danger/30", title: "text-danger-ink", icon: "warning" },
  success: { box: "bg-success-tint border-success/25", title: "text-success-ink", icon: "check" },
  neutral: { box: "bg-paper border-line", title: "text-ink", icon: "info" },
};

export function Notice({
  tone = "info",
  title,
  icon,
  action,
  className,
  children,
}: {
  tone?: NoticeTone;
  title?: ReactNode;
  icon?: IconName;
  action?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  const look = NOTICE_TONES[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : undefined}
      className={clsx("flex gap-3 rounded-[18px] border p-4 text-ink", look.box, className)}
    >
      <Icon name={icon ?? look.icon} size={24} className={clsx("mt-0.5 shrink-0", look.title)} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {title && <p className={clsx("font-semibold leading-snug", look.title)}>{title}</p>}
        {children && <div className="leading-snug text-ink-2">{children}</div>}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}

export type PillTone = "neutral" | "ink" | "success" | "warning" | "danger" | "info" | "gold";

const PILL_TONES: Record<PillTone, string> = {
  neutral: "bg-surface text-ink-2 border-line",
  ink: "bg-ink text-white border-ink",
  success: "bg-success-tint text-success-ink border-success/25",
  warning: "bg-warning-tint text-warning-ink border-warning",
  danger: "bg-danger-tint text-danger-ink border-danger/30",
  info: "bg-sky-tint text-sea-deep border-sky",
  gold: "bg-gold-tint text-gold-deep border-gold/60",
};

export function Pill({
  tone = "neutral",
  icon,
  dot = false,
  className,
  children,
}: {
  tone?: PillTone;
  icon?: IconName;
  dot?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={clsx(
        "inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 text-[0.875rem] font-semibold leading-none whitespace-nowrap",
        PILL_TONES[tone],
        className,
      )}
    >
      {dot && <span aria-hidden className="size-2 rounded-full bg-current" />}
      {icon && <Icon name={icon} size={16} />}
      {children}
    </span>
  );
}

export function SimulatedTag({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex h-6 items-center rounded-full border border-dashed border-line-strong/70 px-2.5 text-[0.75rem] font-semibold text-ink-2",
        className,
      )}
    >
      simulasi
    </span>
  );
}

const AVATAR_SIZES = { sm: "size-9 text-[0.8125rem]", md: "size-11 text-[0.9375rem]", lg: "size-14 text-lg" } as const;

export function Avatar({ initials, size = "md", className }: { initials: string; size?: keyof typeof AVATAR_SIZES; className?: string }) {
  return (
    <span
      aria-hidden
      className={clsx(
        "inline-grid shrink-0 place-items-center rounded-full bg-sky-tint font-semibold tracking-wide text-sea-deep",
        AVATAR_SIZES[size],
        className,
      )}
    >
      {initials}
    </span>
  );
}

export function LedgerRow({
  label,
  value,
  strong = false,
  muted = false,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  strong?: boolean;
  muted?: boolean;
  className?: string;
}) {
  return (
    <div className={clsx("flex items-baseline gap-2", muted && "text-ink-2", strong && "font-semibold", className)}>
      <span className="min-w-0">{label}</span>
      <span aria-hidden className="h-0 min-w-4 flex-1 translate-y-[-0.3em] border-b-2 border-dotted border-line" />
      <span className="tabular shrink-0 whitespace-nowrap">{value}</span>
    </div>
  );
}

export function SourceNote({ children, simulated = false, className }: { children: ReactNode; simulated?: boolean; className?: string }) {
  return (
    <p className={clsx("flex items-start gap-2 text-[0.875rem] leading-snug text-ink-2", className)}>
      <Icon name="info" size={16} className="mt-0.5 shrink-0" />
      <span>
        {children}
        {simulated && <SimulatedTag className="ml-2 align-middle" />}
      </span>
    </p>
  );
}
