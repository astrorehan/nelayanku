import type { Metadata } from "next";
import { BuyerOrdersView } from "@/components/buyer/buyer-orders-view";

export const metadata: Metadata = { title: "Pesanan pembeli" };

export default function BuyerPage() {
  return <BuyerOrdersView />;
}
