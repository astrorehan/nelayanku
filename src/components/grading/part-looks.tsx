import type { EyeManualOption, GillManualOption } from "@/ai/sample-photos";

const EYE_LOOKS: Record<EyeManualOption, { pupil: string; iris: string; haze: number; shine: number; sunken: boolean }> = {
  bulging_clear: { pupil: "#0b1620", iris: "#e3a531", haze: 0, shine: 0.95, sunken: false },
  flat_slightly_cloudy: { pupil: "#2b3944", iris: "#c99a4b", haze: 0.3, shine: 0.55, sunken: false },
  sunken_cloudy: { pupil: "#7c858c", iris: "#a59a85", haze: 0.58, shine: 0, sunken: true },
};

export function EyeLook({ option }: { option: EyeManualOption }) {
  const look = EYE_LOOKS[option];
  return (
    <svg viewBox="0 0 48 48" className="size-12 shrink-0" aria-hidden>
      <circle cx="24" cy="24" r="22" fill={look.sunken ? "#cfc6b4" : "var(--color-paper-deep)"} />
      {look.sunken && <circle cx="24" cy="25.5" r="19" fill="#b4aa95" />}
      <circle cx="24" cy="24" r="17" fill={look.iris} />
      <circle cx="24" cy="24" r="10.5" fill={look.pupil} />
      <circle cx="24" cy="24" r="17" fill="#ffffff" opacity={look.haze} />
      {look.shine > 0 && (
        <>
          <ellipse cx="18" cy="17.5" rx="4.2" ry="3.2" fill="#ffffff" opacity={look.shine} transform="rotate(-30 18 17.5)" />
          <circle cx="29" cy="29.5" r="1.4" fill="#ffffff" opacity={look.shine * 0.8} />
        </>
      )}
      <circle cx="24" cy="24" r="17" fill="none" stroke="var(--color-ink)" strokeWidth="1.6" />
    </svg>
  );
}

const GILL_LOOKS: Record<GillManualOption, { flesh: string; filament: string; slime: number }> = {
  bright_red: { flesh: "#cf2a2f", filament: "#8f1218", slime: 0 },
  faded_red: { flesh: "#d0857a", filament: "#9a5248", slime: 0.12 },
  brown_grey: { flesh: "#8a7a6a", filament: "#584b40", slime: 0.32 },
};

export function GillLook({ option }: { option: GillManualOption }) {
  const look = GILL_LOOKS[option];
  return (
    <svg viewBox="0 0 48 48" className="size-12 shrink-0" aria-hidden>
      <rect x="2" y="2" width="44" height="44" rx="12" fill={look.flesh} />
      <g fill="none" stroke={look.filament} strokeWidth="2.2" strokeLinecap="round">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <path key={index} d={`M${8 + index * 6} 41C${7 + index * 6} 31 ${10 + index * 6} 19 ${17 + index * 5.4} 8`} />
        ))}
      </g>
      <rect x="2" y="2" width="44" height="44" rx="12" fill="#e8e4dc" opacity={look.slime} />
      <rect x="2" y="2" width="44" height="44" rx="12" fill="none" stroke="var(--color-ink)" strokeWidth="1.6" />
    </svg>
  );
}
