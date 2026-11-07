import type { Metadata } from "next";
import { BatchTrace } from "@/components/tracking/batch-trace";

export const metadata: Metadata = {
  title: "Bukti mutu kiriman",
  robots: { index: false, follow: false },
};
export default async function BatchTracePage({
  params,
}: {
  params: Promise<{ kode: string }>;
}) {
  const { kode } = await params;
  return (
    <>
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <BatchTrace code={kode} />
      </main>
    </>
  );
}
