import type { Metadata } from "next";
import { JudgeTour } from "@/components/tour/judge-tour";

export const metadata: Metadata = { title: "Panduan juri", description: "Ikuti satu kiriman Nelayanku dalam sembilan langkah, dari dermaga sampai bagi hasil nelayan." };

export default function JudgePage() {
  return <main id="main-content" className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 pb-16 sm:px-6 lg:py-10"><JudgeTour /></main>;
}
