import type { Metadata } from "next";
import { BuyerOrderDetail } from "@/components/buyer/buyer-order-detail";

export const metadata: Metadata = { title: "Rincian pesanan" };

export default async function BuyerOrderPage({ params }: PageProps<"/pembeli/pesanan/[kode]">) {
  const { kode } = await params;
  return <BuyerOrderDetail code={decodeURIComponent(kode)} />;
}
