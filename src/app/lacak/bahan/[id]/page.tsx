import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/public-header";
import { MaterialTrace } from "@/components/tracking/material-trace";

export const metadata: Metadata = {
  title: "Asal bahan olahan",
  robots: { index: false, follow: false },
};
export default async function MaterialTracePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <PublicHeader ctaMode="never" />
      <main id="main-content" className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <MaterialTrace id={id} />
      </main>
    </>
  );
}
