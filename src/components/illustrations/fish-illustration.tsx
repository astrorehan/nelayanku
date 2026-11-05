import clsx from "clsx";
import type { SpeciesId } from "@/data/types";

const TUNA_BODY = "M24 28C40 18 70 12 90 15C104 18 112 25 115 30C112 35 104 42 90 45C70 48 40 42 24 32Z";
const TUNA_BACK = "M24 28C40 18 70 12 90 15C104 18 112 25 115 30C80 27.5 50 27.5 24 30Z";
const TAIL = "M5 15L25 28.5V31.5L5 45L12.5 30Z";
const MACKEREL_BODY = "M26 27C40 15 66 9 88 12C103 15 112 23 115 30C112 37 103 45 88 48C66 51 40 45 26 33Z";
const MACKEREL_BACK = "M26 27C40 15 66 9 88 12C103 15 112 23 115 30C82 26 52 26 26 30Z";

function Fins({ mackerel }: { mackerel: boolean }) {
  const top = mackerel ? 11 : 14;
  return (
    <g fill="var(--color-ink)">
      <path d={`M54 ${top + 3}L61 ${top - 7}L71 ${top + 1}Z`} />
      <path d={`M81 ${top}L85 ${top - 5}L89 ${top + 1}Z`} />
      {[34, 39, 44].map((x) => (
        <path key={`t${x}`} d={`M${x} ${mackerel ? 23 : 24}l2.4-3 1.2 3.4Z`} />
      ))}
      {[34, 39, 44].map((x) => (
        <path key={`b${x}`} d={`M${x} ${mackerel ? 37 : 36}l2.4 3 1.2-3.4Z`} />
      ))}
      <path d={`M72 ${mackerel ? 47 : 45}L75 ${mackerel ? 53 : 51}L79 ${mackerel ? 47 : 45}Z`} />
      <path d="M97 31C90 33 84 36 79 40C86 39 92 37 98 34Z" />
    </g>
  );
}

function Head() {
  return (
    <>
      <path d="M100 21.5C96.6 26.5 96.6 33.5 100 38.5" fill="none" stroke="var(--color-ink)" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="106.5" cy="27" r="3.4" fill="var(--color-gold)" />
      <circle cx="107" cy="27" r="1.4" fill="var(--color-ink)" />
    </>
  );
}

function Tongkol() {
  return (
    <>
      <path d={TAIL} fill="var(--color-ink)" />
      <path d={TUNA_BODY} fill="var(--color-surface)" stroke="var(--color-ink)" strokeWidth="1.6" />
      <path d={TUNA_BACK} fill="var(--color-ink)" />
      <g fill="none" stroke="var(--color-paper-deep)" strokeWidth="1.7" strokeLinecap="round">
        {[42, 50, 58, 66, 74].map((x, index) => (
          <path key={x} d={`M${x} ${23 - index * 0.8}q4 2 5 ${5.2 + index * 0.4}`} />
        ))}
      </g>
      <g fill="var(--color-ink)">
        <circle cx="86" cy="37.5" r="1.4" />
        <circle cx="81.5" cy="39.5" r="1.3" />
        <circle cx="87.5" cy="41" r="1.1" />
      </g>
      <Fins mackerel={false} />
      <Head />
    </>
  );
}

function Cakalang() {
  return (
    <>
      <path d={TAIL} fill="var(--color-ink)" />
      <path d={TUNA_BODY} fill="var(--color-surface)" stroke="var(--color-ink)" strokeWidth="1.6" />
      <path d={TUNA_BACK} fill="var(--color-ink)" />
      <g fill="none" stroke="var(--color-ink)" strokeWidth="1.6" strokeLinecap="round">
        <path d="M33 33.5C55 36.5 80 37.5 103 34.5" />
        <path d="M38 37.5C58 40.5 80 41 99 38.5" />
        <path d="M45 41.5C62 43.6 80 43.8 94 42" />
      </g>
      <Fins mackerel={false} />
      <Head />
    </>
  );
}

function Kembung() {
  return (
    <>
      <path d={TAIL} fill="var(--color-ink-2)" />
      <path d={MACKEREL_BODY} fill="var(--color-surface)" stroke="var(--color-ink)" strokeWidth="1.6" />
      <path d={MACKEREL_BACK} fill="var(--color-ink-2)" />
      <g fill="var(--color-ink)">
        {[44, 52, 60, 68, 76, 84].map((x, index) => (
          <circle key={x} cx={x} cy={18.5 - Math.sin(index / 1.6) * 1.6} r="1.5" />
        ))}
        {[48, 56, 64, 72, 80].map((x) => (
          <circle key={x} cx={x} cy="23" r="1.2" />
        ))}
      </g>
      <Fins mackerel />
      <Head />
    </>
  );
}

const ILLUSTRATIONS: Record<SpeciesId, () => React.JSX.Element> = { tongkol: Tongkol, cakalang: Cakalang, kembung: Kembung };

export function FishIllustration({ species, className, title }: { species: SpeciesId; className?: string; title?: string }) {
  const Drawing = ILLUSTRATIONS[species];
  return (
    <svg
      viewBox="0 0 120 60"
      className={clsx("h-auto w-full", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <Drawing />
    </svg>
  );
}
