import type { Metadata } from "next";
import { FaqPage } from "@/components/support/faq-page";

export const metadata: Metadata = {
  title: "Tanya jawab",
  description:
    "Privasi halaman lacak, cara kerja offline, kenapa masih simulasi, beda skor mutu dengan sertifikat SNI, dan siapa yang membayar.",
};

export default function Page() {
  return <FaqPage />;
}
