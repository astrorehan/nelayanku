import clsx from "clsx";
import { Icon } from "@/components/icons/icon";
import { Pill } from "@/components/ui/surface";
import {
  gainOverPortPrice,
  ICE_AND_TRANSPORT_PER_KG,
  KUB_FUND_RATE,
  PLATFORM_FEE_RATE,
  SHRINKAGE_RESERVE_RATE,
  type BreakdownLine,
  type BreakdownLineKey,
  type BuyerKind,
  type PriceBreakdown,
} from "@/domain/pricing";
import { formatPercent, formatRupiah, formatSignedRupiah } from "@/lib/format";

const LINE_LABEL: Record<BreakdownLineKey, string> = {
  buyer_price: "Dibayar pembeli",
  ice_and_transport: "Es dan angkut",
  kub_fund: "Kas KUB",
  platform_fee: "Biaya layanan",
  shrinkage_reserve: "Cadangan susut",
};

function lineFormula(key: BreakdownLineKey, buyerKind: BuyerKind): string {
  switch (key) {
    case "buyer_price":
      return "Harga per kg yang disepakati di pesanan.";
    case "ice_and_transport":
      return `Biaya tetap ${formatRupiah(ICE_AND_TRANSPORT_PER_KG)}/kg untuk es dan angkut ke pembeli.`;
    case "kub_fund":
      return `${formatPercent(KUB_FUND_RATE)} dari harga pembeli untuk kas bersama KUB.`;
    case "platform_fee":
      return buyerKind === "sppg"
        ? "Rp0 untuk dapur SPPG karena aturan BGN melarang komisi dalam pengadaan SPPG."
        : `${formatPercent(PLATFORM_FEE_RATE)} dari harga pembeli untuk Nelayanku.`;
    case "shrinkage_reserve":
      return `${formatPercent(SHRINKAGE_RESERVE_RATE)} dari harga pembeli, disimpan bila ada ikan yang susut atau ditolak sebagian.`;
  }
}

function lineLabel(line: BreakdownLine, buyerKind: BuyerKind): string {
  if (line.key === "buyer_price") {
    return buyerKind === "sppg" ? "Dibayar dapur SPPG" : LINE_LABEL.buyer_price;
  }
  return line.rate ? `${LINE_LABEL[line.key]} (${formatPercent(line.rate)})` : LINE_LABEL[line.key];
}

function lineAmount(line: BreakdownLine): string {
  if (line.key === "buyer_price" || line.amountPerKg === 0) {
    return formatRupiah(line.amountPerKg);
  }
  return `− ${formatRupiah(line.amountPerKg)}`;
}

export function PriceBreakdownList({
  breakdown,
  buyerKind,
  portPricePerKg,
  className,
}: {
  breakdown: PriceBreakdown;
  buyerKind: BuyerKind;
  portPricePerKg: number;
  className?: string;
}) {
  const gain = gainOverPortPrice(breakdown.fisherReceivesPerKg, portPricePerKg);
  return (
    <div className={clsx("flex flex-col", className)}>
      {breakdown.lines.map((line) => (
        <details key={line.key} className="group border-b border-line">
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 py-2 [&::-webkit-details-marker]:hidden">
            <span className={clsx("min-w-0 flex-1", line.key === "buyer_price" && "font-bold")}>{lineLabel(line, buyerKind)}</span>
            <span className={clsx("tabular shrink-0 whitespace-nowrap", line.key === "buyer_price" ? "font-bold" : "text-ink-2")}>
              {lineAmount(line)}
            </span>
            <Icon name="chevronDown" size={18} className="shrink-0 text-ink-3 transition-transform group-open:rotate-180" />
          </summary>
          <p className="pb-3 pr-7 leading-snug text-ink-2">{lineFormula(line.key, buyerKind)}</p>
        </details>
      ))}
      <div className="flex items-baseline justify-between gap-3 border-b-2 border-ink py-3">
        <span className="font-bold">Diterima nelayan</span>
        <span className="type-num-m">{formatRupiah(breakdown.fisherReceivesPerKg)}</span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-3 text-ink-2">
        <span>Harga TPI hari ini</span>
        <span className="flex items-center gap-2">
          <span className="tabular">{formatRupiah(portPricePerKg)}</span>
          <Pill tone={gain >= 0 ? "success" : "warning"}>
            {gain >= 0 ? "+" : ""}
            {formatPercent(gain)} untuk nelayan
          </Pill>
        </span>
      </div>
      <p className="sr-only">
        Selisih untuk nelayan {formatSignedRupiah(breakdown.fisherReceivesPerKg - portPricePerKg)} per kg dibanding TPI.
      </p>
    </div>
  );
}
