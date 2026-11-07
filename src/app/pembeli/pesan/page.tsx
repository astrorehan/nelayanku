import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderForm } from "@/components/buyer/order-form";

export const metadata: Metadata = { title: "Pesan untuk besok" };

export default function PlaceOrderPage() {
  return (
    <Suspense fallback={null}>
      <OrderForm />
    </Suspense>
  );
}
