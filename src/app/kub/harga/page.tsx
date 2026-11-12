import type { Metadata } from "next";
import { PricesView } from "@/components/operator/prices-view";

export const metadata: Metadata = { title: "Harga hari ini" };

export default function PricesPage() {
  return <PricesView />;
}
