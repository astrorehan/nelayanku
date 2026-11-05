import type { Metadata } from "next";
import { TryGradingWorkbench } from "@/components/grading/try-grading-workbench";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";

export const metadata: Metadata = {
  title: "Coba nilai kesegaran ikan",
  description: "Pilih foto mata ikan dan lihat skor kesegaran gaya SNI 2729, langsung di browser tanpa daftar akun.",
};

export default function TryGradingPage() {
  return (
    <>
      <PublicHeader ctaMode="never" />
      <main id="main-content" className="mx-auto flex max-w-[76rem] flex-col gap-8 px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <div className="flex max-w-3xl flex-col gap-3">
          <h1 className="type-title">Coba nilai kesegaran ikan</h1>
          <p className="type-lead text-ink-2">
            Enam foto contoh memakai hasil simulasi mata ikan. Insang, bau, dan tekstur diisi manusia. Foto unggahan Anda dinilai manual, tanpa daftar akun.
          </p>
        </div>
        <TryGradingWorkbench />
      </main>
      <PublicFooter />
    </>
  );
}
