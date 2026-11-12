import type { Metadata } from "next";
import { BuyerDocumentsView } from "@/components/buyer/buyer-documents-view";

export const metadata: Metadata = { title: "Dokumen & faktur" };

export default function BuyerDocumentsPage() {
  return <BuyerDocumentsView />;
}
