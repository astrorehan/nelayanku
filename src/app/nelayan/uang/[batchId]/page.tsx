import type { Metadata } from "next";
import { FisherPayoutDetail } from "@/components/fisher/fisher-payout-detail";

export const metadata: Metadata = { title: "Kenapa harganya segini" };

export default async function FisherPayoutPage({ params }: { params: Promise<{ batchId: string }> }) {
  const { batchId } = await params;
  return <FisherPayoutDetail batchId={batchId} />;
}
