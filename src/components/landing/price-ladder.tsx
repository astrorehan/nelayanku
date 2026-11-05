"use client";

import clsx from "clsx";
import { motion, useReducedMotion } from "motion/react";
import { CountUp } from "@/components/ui/meters";
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

function Bar({ rung, index }: { rung: Rung; index: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-ink-2">
          {rung.label}
          <a href={`#sumber-${rung.source}`} className="ml-0.5 align-super text-[0.75rem] font-bold text-ink-2 no-underline hover:text-ink">
            {rung.source}
          </a>
        </span>
        <CountUp value={rung.value} format={formatRupiah} className="text-lg font-bold whitespace-nowrap" durationSeconds={1.1} />
      </div>
      <div className="relative h-[1.125rem] overflow-hidden rounded-full bg-paper-deep sm:h-[1.375rem]">
        <motion.div
          className={clsx("absolute inset-y-0 left-0 rounded-full", rung.fill)}
          initial={reduceMotion ? false : { width: "0%" }}
          animate={{ width: `${(rung.value / scaleMax) * 100}%` }}
          transition={{ duration: 0.9, ease: [0.22, 0.8, 0.24, 1], delay: 0.15 + index * 0.14 }}
        >
          {rung.marker && <span className="absolute right-1 top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-gold sm:size-3" />}
        </motion.div>
      </div>
    </div>
  );
}

export function PriceLadder() {
  return (
    <figure className="flex flex-col gap-5 rounded-[24px] border border-line bg-surface p-5 shadow-raised sm:p-7">
      <figcaption className="type-h3">Per kg tongkol, siapa dapat berapa?</figcaption>
      <div className="flex flex-col gap-3.5">
        <p className="type-eyebrow">Hari ini</p>
        {TODAY.map((rung, index) => (
          <Bar key={rung.label} rung={rung} index={index} />
        ))}
      </div>
      <div className="flex flex-col gap-3.5 border-t border-dashed border-line pt-5">
        <p className="flex items-center gap-2">
          <span className="type-eyebrow">Lewat NELAYANKU</span>
          <SimulatedTag />
        </p>
        {WITH_NELAYANKU.map((rung, index) => (
          <Bar key={rung.label} rung={rung} index={index + 2} />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <span className="inline-flex min-h-10 items-center gap-2 self-start rounded-full bg-ink px-4 font-bold text-paper">
          <span aria-hidden className="size-2.5 rounded-full bg-gold" />
          Nelayan +{gainPercent}% dibanding TPI
        </span>
        <p className="text-ink-2">Dapur tetap membayar {belowRetailPercent}% di bawah harga eceran.</p>
      </div>
    </figure>
  );
}
