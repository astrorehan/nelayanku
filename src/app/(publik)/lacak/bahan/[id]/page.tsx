import type { Metadata } from "next";
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
      <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
        <MaterialTrace id={id} />
      </main>
    </>
  );
}
