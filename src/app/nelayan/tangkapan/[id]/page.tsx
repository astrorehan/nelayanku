import type { Metadata } from "next";
import { FisherLandingDetail } from "@/components/fisher/fisher-landing-detail";

export const metadata: Metadata = { title: "Detail tangkapan" };

export default async function FisherLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FisherLandingDetail landingId={id} />;
}
