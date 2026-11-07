import type { Metadata } from "next";
import { FisherPrices } from "@/components/fisher/fisher-prices";

export const metadata: Metadata = { title: "Harga ikan" };

export default function FisherPricesPage() {
  return <FisherPrices />;
}
