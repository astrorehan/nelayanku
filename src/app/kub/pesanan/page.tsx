import type { Metadata } from "next";
import { OrdersView } from "@/components/operator/orders-view";

export const metadata: Metadata = { title: "Pesanan & batch" };

export default function OrdersPage() {
  return <OrdersView />;
}
