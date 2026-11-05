import type { LandingDestination } from "@/data/types";
import { formatKg, formatPercent } from "@/lib/format";

const DESTINATION_ORDER: LandingDestination[] = ["batch", "port_auction", "processing", "not_for_consumption"];

const DESTINATION_NAME: Record<LandingDestination, string> = {
  batch: "Masuk pesanan dapur dan restoran",
  port_auction: "Dijual di TPI",
  processing: "Jadi bahan olahan",
  not_for_consumption: "Bukan untuk dimakan",
};

const DESTINATION_COLOR: Record<LandingDestination, string> = {
  batch: "var(--color-series-order)",
  port_auction: "var(--color-series-auction)",
  processing: "var(--color-series-processing)",
  not_for_consumption: "var(--color-series-reject)",
};

export function DestinationSplit({ destinationKg }: { destinationKg: Record<LandingDestination, number> }) {
  const totalKg = DESTINATION_ORDER.reduce((sum, destination) => sum + destinationKg[destination], 0);
  if (totalKg === 0) {
    return <p className="text-ink-2">Belum ada ikan yang dicatat tujuannya di rentang ini.</p>;
  }
  const parts = DESTINATION_ORDER.map((destination) => ({
    destination,
    kg: destinationKg[destination],
    share: destinationKg[destination] / totalKg,
  }));
  return (
    <div className="flex flex-col gap-4">
      <div
        role="img"
        aria-label={parts.map((part) => `${DESTINATION_NAME[part.destination]} ${formatPercent(part.share)}`).join(", ")}
        className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full"
      >
        {parts
          .filter((part) => part.kg > 0)
          .map((part) => (
            <span key={part.destination} className="h-full" style={{ flexGrow: part.kg, flexBasis: 0, background: DESTINATION_COLOR[part.destination] }} />
          ))}
      </div>
      <ul className="flex flex-col">
        {parts.map((part) => (
          <li key={part.destination} className="flex items-center gap-3 border-t border-line py-2.5 first:border-t-0 first:pt-0">
            <span aria-hidden className="size-3 shrink-0 rounded-[3px]" style={{ background: DESTINATION_COLOR[part.destination] }} />
            <span className="min-w-0 flex-1">{DESTINATION_NAME[part.destination]}</span>
            <span className="tabular text-ink-2">{formatKg(part.kg)}</span>
            <span className="tabular w-12 text-right font-bold">{formatPercent(part.share)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
