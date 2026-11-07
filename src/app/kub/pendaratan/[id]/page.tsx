import type { Metadata } from "next";
import { LandingDetailView } from "@/components/operator/landing-detail-view";

export const metadata: Metadata = { title: "Detail pendaratan" };

export default async function LandingPage({ params }: PageProps<"/kub/pendaratan/[id]">) {
  const { id } = await params;
  return <LandingDetailView landingId={decodeURIComponent(id)} />;
}
