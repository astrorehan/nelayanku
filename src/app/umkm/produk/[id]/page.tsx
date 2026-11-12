import type { Metadata } from "next";
import { ProductDetail } from "@/components/studio/product-detail";

export const metadata: Metadata = { title: "Detail produk" };
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetail id={decodeURIComponent(id)} />;
}
