import type { Metadata } from "next";
import { ReceiveView } from "@/components/buyer/receive-view";

export const metadata: Metadata = { title: "Terima kiriman" };

export default async function ReceivePage({ params }: PageProps<"/pembeli/terima/[kode]">) {
  const { kode } = await params;
  return <ReceiveView code={decodeURIComponent(kode)} />;
}
