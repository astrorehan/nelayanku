"use client";

import clsx from "clsx";
import { useId, type ReactNode } from "react";
import { FishIllustration } from "@/components/illustrations/fish-illustration";
import type { FishSpecies, SpeciesId } from "@/data/types";

export function SpeciesPicker({
  legend,
  species,
  value,
  onChange,
}: {
  legend: ReactNode;
  species: FishSpecies[];
  value: SpeciesId | null;
  onChange: (id: SpeciesId) => void;
}) {
  const name = useId();
  return (
    <fieldset className="flex min-w-0 flex-col gap-2.5">
      <legend className="type-h3 mb-2.5">{legend}</legend>
      <div className="grid grid-cols-3 gap-2.5">
        {species.map((item) => {
          const selected = item.id === value;
          return (
            <label
              key={item.id}
              className={clsx(
                "relative flex cursor-pointer flex-col items-center gap-1 rounded-[18px] bg-surface px-2 pb-3 pt-2 transition-[border-color,box-shadow,transform] duration-150 active:scale-[0.97]",
                "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-ink",
                selected ? "border-[3px] border-ink shadow-raised" : "border-[1.5px] border-line-strong hover:border-ink",
              )}
            >
              <input type="radio" name={name} className="sr-only" checked={selected} onChange={() => onChange(item.id)} />
              <FishIllustration species={item.id} className="max-w-[6.5rem]" />
              <span className="font-semibold">{item.name}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
