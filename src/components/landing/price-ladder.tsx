import clsx from "clsx";
import Image from "next/image";
import type { ReactNode } from "react";
import { SimulatedTag } from "@/components/ui/surface";
import { gainOverPortPrice, priceBreakdown } from "@/domain/pricing";
import { formatRupiah } from "@/lib/format";
import {
  EXAMPLE_SPPG_BUYER_PRICE,
  PORT_AUCTION_TONGKOL_PRICE,
  RETAIL_TONGKOL_PRICE,
} from "@/content/market-facts";

const fisherPrice = priceBreakdown(
  EXAMPLE_SPPG_BUYER_PRICE,
  "sppg",
).fisherReceivesPerKg;
const gainPercent = Math.round(
  gainOverPortPrice(fisherPrice, PORT_AUCTION_TONGKOL_PRICE.value) * 100,
);

function SourceMark({ n }: { n: number }) {
  return (
    <a
      href={`#sumber-${n}`}
      className="ml-1 align-super text-xs font-semibold text-ink-3 underline underline-offset-2 hover:text-sea"
    >
      {n}
    </a>
  );
}

/* Label timbang: kartu harga yang menempel di sisi peti */
function PriceTag({
  label,
  value,
  note,
  strong = false,
  className,
}: {
  label: ReactNode;
  value: string;
  note: ReactNode;
  strong?: boolean;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "relative flex flex-col rounded-[22px] bg-surface p-4 text-left shadow-floating xs:p-5 sm:p-6",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute right-6 top-6 hidden size-3 rounded-full border-2 border-line bg-paper sm:block"
      />
      <p className="text-sm font-semibold text-ink-2">{label}</p>
      <p
        className={clsx(
          "type-money mt-2",
          strong
            ? "text-[1.625rem] text-ink xs:text-[1.875rem] sm:text-[2.5rem]"
            : "text-[1.375rem] text-ink-2 xs:text-[1.625rem] sm:text-[2rem]",
        )}
      >
        {value}
      </p>
      <p
        className={clsx(
          "mt-2 flex items-center gap-2 text-sm",
          strong ? "font-semibold text-ink" : "text-ink-2",
        )}
      >
        {note}
      </p>
    </div>
  );
}

export function PriceLadder() {
  return (
    <figure className="relative mx-auto w-full max-w-[64rem]">
      <div className="relative z-10 mx-auto w-[min(40rem,92%)] -rotate-2">
        <Image
          src="/images/peti-tongkol.webp"
          alt="Ilustrasi tiga ikan tongkol di dalam peti berisi es"
          width={1221}
          height={971}
          priority
          unoptimized
          sizes="(min-width:1024px) 640px, 92vw"
          className="crate-shadow crate-land h-auto w-full"
        />
      </div>
      <figcaption className="sr-only">
        Harga tongkol per kilogram: harga TPI dibanding bagian nelayan lewat
        Nelayanku
      </figcaption>
      <div className="relative z-20 mx-auto -mt-[14%] grid w-full grid-cols-2 gap-3 px-1 sm:gap-5 lg:absolute lg:inset-x-0 lg:bottom-[8%] lg:mt-0 lg:flex lg:justify-between lg:px-0">
        <PriceTag
          label={
            <>
              Harga TPI
              <SourceMark n={1} />
            </>
          }
          value={formatRupiah(PORT_AUCTION_TONGKOL_PRICE.value)}
          note="per kg di lelang"
          className="lg:w-[15.5rem]"
        />
        <PriceTag
          strong
          label={
            <>
              Bagian nelayan
              <SourceMark n={2} />
            </>
          }
          value={formatRupiah(fisherPrice)}
          note={
            <>
              <span className="docket-eye" aria-hidden />+{gainPercent}% dari
              harga TPI
            </>
          }
          className="lg:w-[17rem]"
        />
      </div>
      <p className="relative z-20 mx-auto mt-6 flex max-w-[34rem] flex-wrap items-center justify-center gap-x-2 gap-y-1 px-2 text-center text-sm text-ink-2 lg:mt-10">
        Pembeli membayar {formatRupiah(EXAMPLE_SPPG_BUYER_PRICE)}/kg, harga
        eceran pembanding {formatRupiah(RETAIL_TONGKOL_PRICE.value)}/kg.
        <SimulatedTag />
      </p>
    </figure>
  );
}
