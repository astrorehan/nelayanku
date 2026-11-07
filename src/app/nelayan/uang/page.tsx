import type { Metadata } from "next";
import { FisherMoney } from "@/components/fisher/fisher-money";

export const metadata: Metadata = { title: "Uang masuk" };

export default function FisherMoneyPage() {
  return <FisherMoney />;
}
