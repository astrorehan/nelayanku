"use client";

import clsx from "clsx";
import { useState } from "react";
import { Icon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/fields";
import { Sheet } from "@/components/ui/overlays";
import { Avatar } from "@/components/ui/surface";
import type { Fisher, FishSpecies } from "@/data/types";
import { formatClock } from "@/lib/format";
import { StepHeading } from "./wizard-frame";

export function StepFisher({
  fishers,
  species,
  landedToday,
  selectedId,
  onSelect,
}: {
  fishers: Fisher[];
  species: FishSpecies[];
  landedToday: Map<string, string>;
  selectedId: string | null;
  onSelect: (fisherId: string) => void;
}) {
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [newFisherInfo, setNewFisherInfo] = useState(false);
  const visible = fishers.filter((fisher) => fisher.name.toLowerCase().includes(query.trim().toLowerCase()));
  const speciesName = (id: string) => species.find((candidate) => candidate.id === id)?.name.toLowerCase() ?? id;

  return (
    <>
      <StepHeading>Siapa yang mendarat?</StepHeading>
      {searching && (
        <TextField
          label="Cari nama nelayan"
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ketik nama"
        />
      )}
      <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {visible.map((fisher) => {
          const landedAt = landedToday.get(fisher.id);
          const selected = fisher.id === selectedId;
          return (
            <li key={fisher.id}>
              <button
                type="button"
                onClick={() => onSelect(fisher.id)}
                aria-pressed={selected}
                className={clsx(
                  "flex min-h-[7.25rem] w-full flex-col items-center justify-center gap-1.5 rounded-[18px] bg-surface p-2 text-center transition-[border-color,box-shadow,transform] duration-150 active:scale-[0.97]",
                  selected ? "border-[3px] border-ink shadow-raised" : "border-[1.5px] border-line-strong hover:border-ink",
                )}
              >
                <Avatar initials={fisher.initials} />
                <span className="font-bold leading-tight">{fisher.name}</span>
                <span className="text-[0.9375rem] leading-tight text-ink-2">
                  {landedAt ? (
                    <span className="inline-flex items-center gap-1 text-success-ink">
                      <Icon name="check" size={14} strokeWidth={3} />
                      {landedAt}
                    </span>
                  ) : (
                    speciesName(fisher.usualSpeciesId)
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {visible.length === 0 && <p className="text-ink-2">Tidak ada nama yang cocok.</p>}
      <div className="grid grid-cols-2 gap-2.5">
        <Button variant="quiet" size="lg" icon="search" onClick={() => setSearching((value) => !value)}>
          {searching ? "Tutup cari" : "Cari nama"}
        </Button>
        <Button variant="quiet" size="lg" icon="plus" onClick={() => setNewFisherInfo(true)}>
          Nelayan baru
        </Button>
      </div>
      <Sheet open={newFisherInfo} onOpenChange={setNewFisherInfo} title="Tambah nelayan baru">
        <p className="pb-2 text-ink-2">
          Di versi ini, anggota baru didaftarkan pengurus KUB lewat menu anggota. Setelah terdaftar, namanya muncul di daftar ini.
        </p>
      </Sheet>
    </>
  );
}

export function landedTodayLabels(landings: Array<{ fisherId: string; landedAt: string }>): Map<string, string> {
  const labels = new Map<string, string>();
  for (const landing of landings) {
    labels.set(landing.fisherId, formatClock(landing.landedAt));
  }
  return labels;
}
