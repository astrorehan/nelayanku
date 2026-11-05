import clsx from "clsx";
import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";

const CONTROL =
  "w-full rounded-[14px] border border-line-strong bg-surface px-4 text-base text-ink placeholder:text-ink-3 transition-[border-color,box-shadow] duration-150 hover:border-ink focus:border-sea focus:outline-none focus:shadow-[0_0_0_4px_var(--color-sky)] aria-[invalid=true]:border-danger";

export function TextField({
  label,
  hint,
  error,
  suffix,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; hint?: ReactNode; error?: ReactNode; suffix?: ReactNode }) {
  const id = useId();
  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="font-semibold">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={hint || error ? `${id}-note` : undefined}
          className={clsx(CONTROL, "min-h-[3.25rem]", suffix && "pr-16")}
          {...rest}
        />
        {suffix && <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-ink-2">{suffix}</span>}
      </div>
      {(hint || error) && (
        <p id={`${id}-note`} className={clsx("leading-snug", error ? "font-semibold text-danger-ink" : "text-ink-2")}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

export function TextArea({
  label,
  hint,
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: ReactNode; hint?: ReactNode }) {
  const id = useId();
  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="font-semibold">
        {label}
      </label>
      <textarea id={id} rows={3} className={clsx(CONTROL, "min-h-24 py-3 leading-snug")} {...rest} />
      {hint && <p className="leading-snug text-ink-2">{hint}</p>}
    </div>
  );
}
