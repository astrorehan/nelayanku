import Image from "next/image";
import { LogoMark } from "@/components/brand/logo";
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

export function PriceLadder() {
  return (
    <figure className="min-w-0">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src="/images/tangkapan-pagi.webp"
          alt="Ilustrasi tiga ikan tongkol di dalam peti berisi es, dengan label timbang kosong"
          fill
          priority
          unoptimized
          sizes="(min-width:1024px) 540px, 100vw"
          className="hero-photo"
        />
      </div>
      <figcaption className="flex justify-between gap-3 py-3 text-xs text-ink-2">
        <span>Tongkol · dari dermaga ke dapur</span>
        <span>Ilustrasi</span>
      </figcaption>
      <div className="weighing-docket mt-3 px-5 pb-5 pt-5 sm:px-6">
        <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
          <span className="flex items-center gap-2 font-medium">
            <LogoMark className="h-3 w-auto" />
            Catatan harga
          </span>
          <span className="record-number">Tongkol / 1 kg</span>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-5">
          <div>
            <p className="text-sm text-ink-2">
              Harga TPI
              <a
                href="#sumber-1"
                className="ml-1 align-super text-xs underline"
              >
                1
              </a>
            </p>
            <p className="type-money mt-2 text-2xl text-ink-2">
              {formatRupiah(PORT_AUCTION_TONGKOL_PRICE.value)}
            </p>
          </div>
          <span aria-hidden className="text-xl text-ink-2">
            →
          </span>
          <div>
            <p className="text-sm text-ink-2">
              Bagian nelayan
              <a
                href="#sumber-2"
                className="ml-1 align-super text-xs underline"
              >
                2
              </a>
            </p>
            <p className="type-money mt-2 text-[1.875rem]">
              {formatRupiah(fisherPrice)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p className="flex items-center gap-2 text-sm">
            <span className="docket-eye" aria-hidden />+{gainPercent}% dibanding
            harga TPI
          </p>
          <SimulatedTag />
        </div>
        <p className="mt-3 text-sm text-ink-2">
          Pembeli membayar {formatRupiah(EXAMPLE_SPPG_BUYER_PRICE)}/kg. Harga
          eceran pembanding {formatRupiah(RETAIL_TONGKOL_PRICE.value)}/kg.
        </p>
      </div>
    </figure>
  );
}
