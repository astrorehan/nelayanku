import { formatKg, formatRupiahCompact } from "@/lib/format";
import { localDateOf } from "../demo-clock";
import { DEMO_BUYER_ID, DEMO_FISHER_ID, DEMO_PRODUCER_ID } from "../demo-identities";
import type { DemoDatabase } from "../types";
import { batchesDeliveredOn, batchesForBuyer } from "./batches";
import { buyerSummary, isActiveView } from "./buyer-pages";
import { monthSummary } from "./fisher-pages";
import { landingsOnDate } from "./landings";
import { availableMaterialCards, producerProducts } from "./studio-pages";

export interface RoleStat {
  label: string;
  value: string;
}

export type RoleCardStats = Record<"/kub" | "/nelayan" | "/pembeli" | "/umkm", [RoleStat, RoleStat]>;

/** Two live numbers per role for the sign-in cards, read from the local demo database. */
export function roleCardStats(db: DemoDatabase, now: Date): RoleCardStats {
  const today = localDateOf(now);
  const landings = landingsOnDate(db, today);
  const landedKg = landings.reduce((sum, view) => sum + view.landing.weightKg, 0);
  const ordersToday = batchesDeliveredOn(db, today, now).filter((view) => view.batch.status !== "cancelled");

  const month = monthSummary(db, DEMO_FISHER_ID, now);

  const buyerViews = batchesForBuyer(db, DEMO_BUYER_ID, now);
  const buyer = buyerSummary(buyerViews, now);

  const materials = availableMaterialCards(db, DEMO_PRODUCER_ID, now);
  const materialKg = materials.reduce((sum, card) => sum + card.kg, 0);

  return {
    "/kub": [
      { label: "Pendaratan hari ini", value: `${formatKg(landedKg)} dari ${landings.length} catatan` },
      { label: "Pesanan diantar hari ini", value: String(ordersToday.length) },
    ],
    "/nelayan": [
      { label: "Terjual bulan ini", value: formatKg(month.soldKg) },
      { label: "Sisa utang", value: formatRupiahCompact(month.outstandingDebt) },
    ],
    "/pembeli": [
      { label: "Pesanan berjalan", value: String(buyerViews.filter(isActiveView).length) },
      { label: "Diterima bulan ini", value: formatKg(buyer.kgThisMonth) },
    ],
    "/umkm": [
      { label: "Bahan olahan tersedia", value: formatKg(materialKg) },
      { label: "Produk di studio", value: String(producerProducts(db, DEMO_PRODUCER_ID).length) },
    ],
  };
}
