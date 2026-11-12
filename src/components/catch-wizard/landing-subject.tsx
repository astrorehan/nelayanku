import { Avatar } from "@/components/ui/surface";
import type { Fisher, FishSpecies } from "@/data/types";
import { formatKg } from "@/lib/format";

export function LandingSubject({
  fisher,
  species,
  weightKg,
  iced,
}: {
  fisher: Fisher;
  species: FishSpecies;
  weightKg: number;
  iced: boolean;
}) {
  return (
    <p className="flex items-center gap-2.5 text-ink-2">
      <Avatar initials={fisher.initials} size="sm" />
      <span className="min-w-0">
        <b className="text-ink">
          {species.name} Pak {fisher.name}
        </b>{" "}
        · {formatKg(weightKg)} · {iced ? "pakai es" : "tanpa es"}
      </span>
    </p>
  );
}
