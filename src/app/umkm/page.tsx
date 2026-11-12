import type { Metadata } from "next";
import { StudioHome } from "@/components/studio/studio-home";

export const metadata: Metadata = { title: "Beranda studio" };
export default function StudioHomePage() {
  return <StudioHome />;
}
