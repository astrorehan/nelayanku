import type { Metadata } from "next";
import { StudioView } from "@/components/studio/studio-view";

export const metadata: Metadata = { title: "Studio UMKM" };
export default function StudioPage() {
  return <StudioView />;
}
