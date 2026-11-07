import type { Metadata } from "next";
import { BuyerOverview } from "@/components/buyer/buyer-overview";

export const metadata: Metadata = { title: "Ringkasan" };

export default function BuyerPage() {
  return <BuyerOverview />;
}
