import type { Metadata } from "next";
import { BuyerOrdersView } from "@/components/buyer/buyer-orders-view";

export const metadata: Metadata = { title: "Pesanan" };

export default function BuyerOrdersPage() {
  return <BuyerOrdersView />;
}
