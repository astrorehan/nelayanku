import type { Metadata } from "next";
import { AboutPage } from "@/components/support/about-page";

export const metadata: Metadata = {
  title: "Tentang Nelayanku",
  description:
    "Masalah nelayan kecil di Bengkulu, apa yang kami bangun, tim, sumber data, dan batas demo ini.",
};

export default function Page() {
  return <AboutPage />;
}
