"use client";

import clsx from "clsx";
import { SpeciesPicker } from "@/components/fish/species-picker";
import { ChoiceGroup, NumberPad } from "@/components/ui/choices";
import { Avatar } from "@/components/ui/surface";
import type { Fisher, FishSpecies, SpeciesId } from "@/data/types";
import { StepHeading } from "./wizard-frame";

export function StepCatch({
  fisher,
  species,
  speciesId,
  onSpecies,
  iced,
  onIced,
  weightText,
  onWeight,
}: {
  fisher: Fisher;
  species: FishSpecies[];
  speciesId: SpeciesId;
  onSpecies: (id: SpeciesId) => void;
  iced: boolean | null;
  onIced: (iced: boolean) => void;
  weightText: string;
  onWeight: (value: string) => void;
}) {
  return (
    <>
      <div className="flex items-center gap-3">
        <Avatar initials={fisher.initials} />
        <StepHeading size="h2">Tangkapan Pak {fisher.name}</StepHeading>
      </div>

      <SpeciesPicker legend="Ikan apa?" species={species} value={speciesId} onChange={onSpecies} />

      <ChoiceGroup
        legend="Diberi es sejak di kapal?"
        value={iced === null ? null : iced ? "yes" : "no"}
        onChange={(value) => onIced(value === "yes")}
        columns={2}
        options={[
          { value: "yes", title: "Ya, pakai es", icon: "ice" },
          { value: "no", title: "Tidak pakai es", icon: "warning" },
        ]}
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <p className="type-h3">Berat timbangan</p>
          <p className="hidden text-[0.9375rem] text-ink-2 [@media(pointer:fine)]:block">bisa juga diketik</p>
        </div>
        <output
          aria-live="polite"
          className="flex min-h-20 items-baseline justify-center gap-2 rounded-[18px] border border-line bg-paper-deep/60 px-4 py-3"
        >
          <span className={clsx("type-num-xl", weightText === "" && "text-ink-3")}>{weightText === "" ? "0" : weightText}</span>
          <span className="type-h2 text-ink-2">kg</span>
        </output>
        <NumberPad value={weightText} onChange={onWeight} label="Papan angka berat" listenToKeyboard />
      </div>
    </>
  );
}
