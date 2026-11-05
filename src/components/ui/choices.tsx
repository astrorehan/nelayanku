"use client";

import clsx from "clsx";
import { useEffect, useId, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons/icon";

export interface ChoiceOption<T extends string> {
  value: T;
  title: ReactNode;
  description?: ReactNode;
  icon?: IconName;
  visual?: ReactNode;
  disabled?: boolean;
}

const COLUMNS = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-1 sm:grid-cols-3", 4: "grid-cols-2 sm:grid-cols-4" } as const;

export function ChoiceGroup<T extends string>({
  legend,
  hideLegend = false,
  value,
  onChange,
  options,
  columns = 2,
  layout = "row",
  className,
}: {
  legend: ReactNode;
  hideLegend?: boolean;
  value: T | null;
  onChange: (value: T) => void;
  options: ChoiceOption<T>[];
  columns?: keyof typeof COLUMNS;
  layout?: "row" | "stack";
  className?: string;
}) {
  const name = useId();
  return (
    <fieldset className={clsx("flex min-w-0 flex-col gap-2.5", className)}>
      <legend className={clsx(hideLegend ? "sr-only" : "type-h3 mb-2.5")}>{legend}</legend>
      <div className={clsx("grid gap-2.5", COLUMNS[columns])}>
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className={clsx(
                "group relative flex min-h-14 cursor-pointer rounded-[16px] bg-surface p-3.5 transition-[border-color,box-shadow,transform] duration-150",
                "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink",
                "active:scale-[0.985]",
                layout === "stack" ? "flex-col items-center justify-center gap-2 text-center" : "items-center gap-3",
                selected ? "border-[3px] border-ink shadow-raised" : "border-[1.5px] border-line-strong hover:border-ink",
                option.disabled && "pointer-events-none opacity-45",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                disabled={option.disabled}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.visual}
              {option.icon && !option.visual && (
                <Icon name={option.icon} size={28} className={clsx("shrink-0", selected ? "text-ink" : "text-ink-2")} />
              )}
              <span className="flex min-w-0 flex-col">
                <span className="font-bold leading-snug">{option.title}</span>
                {option.description && <span className="text-base leading-snug text-ink-2">{option.description}</span>}
              </span>
              {selected && (
                <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-ink text-paper shadow-raised">
                  <Icon name="check" size={15} strokeWidth={3} />
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function CheckChoice({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <label
      className={clsx(
        "flex min-h-16 cursor-pointer items-center gap-3.5 rounded-[16px] bg-surface p-3.5 transition-[border-color,box-shadow,transform] duration-150 active:scale-[0.985]",
        "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink",
        checked ? "border-[3px] border-ink shadow-raised" : "border-[1.5px] border-line-strong hover:border-ink",
      )}
    >
      <input type="checkbox" className="sr-only" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span
        aria-hidden
        className={clsx(
          "grid size-8 shrink-0 place-items-center rounded-[9px] border-2 transition-colors duration-150",
          checked ? "border-ink bg-ink text-paper" : "border-line-strong bg-surface",
        )}
      >
        {checked && <Icon name="check" size={20} strokeWidth={3} />}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="font-bold leading-snug">{title}</span>
        {description && <span className="leading-snug text-ink-2">{description}</span>}
      </span>
    </label>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; title: ReactNode }>;
  className?: string;
}) {
  const name = useId();
  return (
    <div role="radiogroup" aria-label={label} className={clsx("flex gap-1 rounded-[14px] bg-paper-deep p-1", className)}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <label
            key={option.value}
            className={clsx(
              "flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-[11px] px-3 text-center font-bold transition-[background-color,box-shadow,color] duration-150",
              "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-ink",
              selected ? "bg-surface text-ink shadow-raised" : "text-ink-2 hover:text-ink",
            )}
          >
            <input type="radio" name={name} className="sr-only" checked={selected} onChange={() => onChange(option.value)} />
            {option.title}
          </label>
        );
      })}
    </div>
  );
}

const PAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "erase"] as const;
type PadKey = (typeof PAD_KEYS)[number];

export function applyPadKey(value: string, key: PadKey, maxIntegerDigits: number): string {
  if (key === "erase") {
    return value.slice(0, -1);
  }
  if (key === ",") {
    return value.includes(",") ? value : value === "" ? "0," : `${value},`;
  }
  const [integerPart, decimalPart] = value.split(",");
  if (decimalPart !== undefined) {
    return decimalPart.length < 1 ? `${value}${key}` : value;
  }
  if (integerPart === "0") {
    return key;
  }
  return integerPart.length < maxIntegerDigits ? `${value}${key}` : value;
}

function padKeyFromKeyboard(event: KeyboardEvent): PadKey | null {
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return null;
  }
  if (/^[0-9]$/.test(event.key)) {
    return event.key as PadKey;
  }
  if (event.key === "," || event.key === ".") {
    return ",";
  }
  return event.key === "Backspace" ? "erase" : null;
}

const TEXT_ENTRY_SELECTOR =
  'input:not([type="radio"]):not([type="checkbox"]):not([type="button"]):not([type="submit"]), textarea, select, [contenteditable="true"]';

function isTypingElsewhere(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.matches(TEXT_ENTRY_SELECTOR) || target.closest("[role=dialog]") !== null);
}

export function NumberPad({
  value,
  onChange,
  maxIntegerDigits = 3,
  label,
  listenToKeyboard = false,
}: {
  value: string;
  onChange: (value: string) => void;
  maxIntegerDigits?: number;
  label: string;
  listenToKeyboard?: boolean;
}) {
  const press = (key: PadKey) => {
    globalThis.navigator?.vibrate?.(8);
    onChange(applyPadKey(value, key, maxIntegerDigits));
  };

  useEffect(() => {
    if (!listenToKeyboard) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      const key = padKeyFromKeyboard(event);
      if (!key || event.defaultPrevented || isTypingElsewhere(event.target)) {
        return;
      }
      event.preventDefault();
      onChange(applyPadKey(value, key, maxIntegerDigits));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [listenToKeyboard, value, onChange, maxIntegerDigits]);

  return (
    <div role="group" aria-label={label} className="grid grid-cols-3 gap-2">
      {PAD_KEYS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => press(key)}
          aria-label={key === "erase" ? "Hapus angka terakhir" : key === "," ? "Koma" : key}
          className="tabular grid h-14 place-items-center rounded-[14px] border border-line bg-surface text-2xl font-bold text-ink transition-[transform,background-color] duration-100 hover:bg-paper active:scale-[0.96] active:bg-paper-deep"
        >
          {key === "erase" ? <Icon name="arrowLeft" size={26} /> : key}
        </button>
      ))}
    </div>
  );
}

export function parseDecimal(value: string): number {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function Stepper({ step, total, label }: { step: number; total: number; label: string }) {
  return (
    <div className="flex gap-1.5" role="progressbar" aria-label={label} aria-valuemin={1} aria-valuemax={total} aria-valuenow={step}>
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={clsx(
            "h-1.5 flex-1 rounded-full transition-colors duration-300",
            index < step ? "bg-ink" : "bg-paper-deep",
          )}
        />
      ))}
    </div>
  );
}
