import type { Metadata } from "next";
import { ProductList } from "@/components/studio/product-list";

export const metadata: Metadata = { title: "Produk" };
export default function ProductsPage() {
  return <ProductList />;
}
