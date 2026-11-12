import type { Metadata } from "next";
import { FisherLoans } from "@/components/fisher/fisher-loans";

export const metadata: Metadata = { title: "Pinjaman" };

export default function FisherLoansPage() {
  return <FisherLoans />;
}
