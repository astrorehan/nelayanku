import type { Metadata } from "next";
import { FisherLandings } from "@/components/fisher/fisher-landings";

export const metadata: Metadata = { title: "Tangkapan" };

export default function FisherLandingsPage() {
  return <FisherLandings />;
}
