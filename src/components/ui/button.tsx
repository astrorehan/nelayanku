import clsx from "clsx";
import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons/icon";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "ghost" | "danger";
export type ButtonSize = "md" | "lg" | "xl";

interface ButtonLookProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  icon?: IconName;
  iconAfter?: IconName;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-paper shadow-raised [--icon-signal:var(--color-gold)] hover:bg-[#1d3a52] disabled:bg-paper-deep disabled:text-ink-3 disabled:shadow-none disabled:[--icon-signal:currentColor] disabled:border disabled:border-line",
  secondary:
    "bg-surface text-ink border-2 border-ink hover:bg-paper-deep disabled:border-line disabled:text-ink-3 disabled:bg-paper",
  quiet:
    "bg-surface text-ink border border-line-strong hover:border-ink hover:bg-paper disabled:text-ink-3 disabled:border-line",
  ghost: "bg-transparent text-ink hover:bg-paper-deep disabled:text-ink-3",
  danger: "bg-grade-reject text-white shadow-raised hover:bg-[#7f1c05] disabled:bg-paper-deep disabled:text-ink-3",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: "min-h-12 px-4 text-base gap-2 rounded-[12px]",
  lg: "min-h-14 px-5 text-[1.0625rem] gap-2.5 rounded-[14px]",
  xl: "min-h-16 px-6 text-lg gap-3 rounded-[16px]",
};

const ICON_SIZE: Record<ButtonSize, number> = { md: 20, lg: 22, xl: 24 };

export function buttonClasses({ variant = "primary", size = "lg", block = false }: ButtonLookProps = {}) {
  return clsx(
    "inline-flex select-none items-center justify-center text-center font-bold leading-tight",
    "transition-[transform,background-color,border-color,color,box-shadow] duration-150 ease-out",
    "active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    block && "w-full",
  );
}

function ButtonContent({ icon, iconAfter, size = "lg", children }: ButtonLookProps & { children: ReactNode }) {
  return (
    <>
      {icon && <Icon name={icon} size={ICON_SIZE[size]} className="shrink-0" />}
      <span>{children}</span>
      {iconAfter && <Icon name={iconAfter} size={ICON_SIZE[size]} className="shrink-0" />}
    </>
  );
}

type ButtonProps = ButtonLookProps & ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean };

export function Button({ variant, size, block, icon, iconAfter, busy, className, children, type, ...rest }: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      aria-busy={busy || undefined}
      className={clsx(buttonClasses({ variant, size, block }), busy && "cursor-progress", className)}
      {...rest}
    >
      <ButtonContent icon={busy ? "sync" : icon} iconAfter={iconAfter} size={size}>
        {children}
      </ButtonContent>
    </button>
  );
}

type ButtonLinkProps = ButtonLookProps & ComponentProps<typeof Link>;

export function ButtonLink({ variant, size, block, icon, iconAfter, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={clsx(buttonClasses({ variant, size, block }), className)} {...rest}>
      <ButtonContent icon={icon} iconAfter={iconAfter} size={size}>
        {children}
      </ButtonContent>
    </Link>
  );
}
