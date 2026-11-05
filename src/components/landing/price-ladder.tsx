"use client";

import clsx from "clsx";
import { SimulatedTag } from "@/components/ui/surface";
import { gainOverPortPrice, priceBreakdown } from "@/domain/pricing";
import { formatRupiah } from "@/lib/format";
import { EXAMPLE_SPPG_BUYER_PRICE, PORT_AUCTION_TONGKOL_PRICE, RETAIL_TONGKOL_PRICE } from "@/content/market-facts";

interface Rung {
  label: string;
  value: number;
  fill: string;
  source: 1 | 2;
  marker?: boolean;
}

const fisherPrice = priceBreakdown(EXAMPLE_SPPG_BUYER_PRICE, "sppg").fisherReceivesPerKg;
const gainPercent = Math.round(gainOverPortPrice(fisherPrice, PORT_AUCTION_TONGKOL_PRICE.value) * 100);
const belowRetailPercent = Math.round((1 - EXAMPLE_SPPG_BUYER_PRICE / RETAIL_TONGKOL_PRICE.value) * 100);
const scaleMax = RETAIL_TONGKOL_PRICE.value;

const TODAY: Rung[] = [
  { label: "Harga eceran di pasar", value: RETAIL_TONGKOL_PRICE.value, fill: "bg-line", source: 1 },
  { label: "Diterima nelayan di TPI", value: PORT_AUCTION_TONGKOL_PRICE.value, fill: "bg-ink-2", source: 1 },
];

const WITH_NELAYANKU: Rung[] = [
  { label: "Dibayar dapur SPPG", value: EXAMPLE_SPPG_BUYER_PRICE, fill: "bg-line", source: 2 },
  { label: "Diterima nelayan", value: fisherPrice, fill: "bg-ink", source: 2, marker: true },
];

function Bar({ rung }: { rung: Rung }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-ink-2">
          {rung.label}
          <a href={`#sumber-${rung.source}`} className="ml-0.5 align-super text-[0.75rem] font-semibold text-ink-2 no-underline hover:text-ink">
            {rung.source}
          </a>
        </span>
        <span className="tabular whitespace-nowrap text-xl font-medium">{formatRupiah(rung.value)}</span>
      </div>
      <div className="relative h-2 bg-paper-deep">
        <div className={clsx("absolute inset-y-0 left-0", rung.fill)} style={{ width: `${(rung.value / scaleMax) * 100}%` }}>
          {rung.marker && <span className="absolute right-0 top-1/2 size-2 -translate-y-1/2 rounded-full bg-gold" />}
        </div>
      </div>
    </div>
  );
}

export function PriceLadder() {
  return (
    <figure className="flex flex-col gap-6 rounded-[16px] border border-line bg-surface p-6 sm:p-8">
      <figcaption className="type-h3">Per kg tongkol, siapa dapat berapa?</figcaption>
      <div className="flex flex-col gap-4">
        <p className="type-eyebrow">Harga di Pulau Baai</p>
        {TODAY.map((rung) => (
          <Bar key={rung.label} rung={rung} />
        ))}
      </div>
      <div className="flex flex-col gap-4 border-t border-dashed border-line pt-5">
        <p className="flex items-center gap-2">
          <span className="type-eyebrow">Lewat Nelayanku</span>
          <SimulatedTag />
        </p>
        {WITH_NELAYANKU.map((rung) => (
          <Bar key={rung.label} rung={rung} />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <span className="inline-flex items-center gap-2 self-start text-lg font-medium">
          <span aria-hidden className="size-2.5 rounded-full bg-gold" />
          Dalam simulasi, nelayan +{gainPercent}% vs harga TPI
        </span>
        <p className="text-ink-2">Harga dapur {belowRetailPercent}% di bawah eceran pada contoh ini</p>
      </div>
    </figure>
  );
}
