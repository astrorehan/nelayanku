import type { Metadata } from "next";
import { OrderDetail } from "@/components/batch/order-detail";

export const metadata: Metadata = { title: "Pesanan" };

export default async function OrderPage({ params }: PageProps<"/kub/batch/[id]">) {
  const { id } = await params;
  return <OrderDetail batchId={decodeURIComponent(id)} />;
}
