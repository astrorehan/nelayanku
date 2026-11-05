import type { IconName } from "@/components/icons/icon";
import type { RouteChoice, SppgBlock } from "@/data/queries/destinations";
import type { FishSpecies } from "@/data/types";
import { formatClock, formatKg, formatRupiah } from "@/lib/format";

export const ROUTE_ICON: Record<RouteChoice["kind"], IconName> = {
  batch: "crate",
  port_auction: "balance",
  processing: "jar",
  not_for_consumption: "close",
};

export function routeAction(choice: RouteChoice): string {
  switch (choice.kind) {
    case "batch":
      return `Masukkan ${formatKg(choice.kg)} ke pesanan`;
    case "port_auction":
      return "Jual ke TPI hari ini";
    case "processing":
      return "Jadikan bahan olahan";
    case "not_for_consumption":
      return "Catat: bukan untuk dimakan";
  }
}

export function routeTitle(choice: RouteChoice): string {
  switch (choice.kind) {
    case "batch":
      return `Pesanan ${choice.view.species.name} ${choice.view.order.minimumGrade}`;
    case "port_auction":
      return "Jual ke TPI hari ini";
    case "processing":
      return "Bahan olahan";
    case "not_for_consumption":
      return "Bukan untuk dimakan";
  }
}

export function routeDetail(choice: RouteChoice): string {
  switch (choice.kind) {
    case "batch":
      return `${choice.view.buyer.name} · kirim ${formatClock(choice.view.order.deliverAt)}`;
    case "port_auction":
      return `Sekitar ${formatRupiah(choice.pricePerKg)}/kg, rata-rata TPI 7 hari`;
    case "processing":
      return `${formatRupiah(choice.pricePerKg)}/kg untuk pengolah`;
    case "not_for_consumption":
      return "Tidak dijual dan tidak ikut tertimbang";
  }
}

export function sppgBlockCopy(block: SppgBlock, species: FishSpecies, iced: boolean) {
  const hours = iced ? species.freshnessWindow.icedHours : species.freshnessWindow.unicedHours;
  return {
    title: `Tidak bisa masuk ${block.buyerName}`,
    body:
      block.reason === "no_ice"
        ? `${species.name} tanpa es berisiko histamin. Skor kesegaran tidak mengukur histamin.`
        : `Sudah lewat ${hours} jam sejak mendarat. Skor kesegaran tidak mengukur histamin.`,
  };
}
