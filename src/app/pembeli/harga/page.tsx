import type { Metadata } from "next";
import { PriceBoard } from "@/components/prices/price-board";
import { RolePage } from "@/components/layout/role-shell";
import { BuyerTopBar } from "@/components/shells/role-shells";

export const metadata: Metadata = { title: "Harga ikan" };

export default function BuyerPricesPage() {
  return (
    <>
      <BuyerTopBar title="Harga ikan" subtitle="Acuan harga untuk pesanan Anda" />
      <RolePage>
        <PriceBoard audience="buyer" />
      </RolePage>
    </>
  );
}
