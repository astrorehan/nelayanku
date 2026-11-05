import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";

export function PublicFooter({ sources }: { sources?: ReactNode }) {
  return (
    <footer className="border-t border-line bg-paper-deep">
      <div className="mx-auto flex max-w-[76rem] flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div className="flex max-w-sm flex-col gap-3">
            <Logo className="h-7 w-auto self-start" />
            <p className="text-ink-2">Ikan nelayan kecil, mutu terbukti, dibayar adil, tanpa ada yang terbuang.</p>
          </div>
          <nav aria-label="Tautan kaki" className="grid grid-cols-2 gap-x-10 gap-y-2 font-semibold sm:flex sm:gap-6">
            <Link href="/coba" className="py-1.5 hover:underline">
              Coba nilai ikan
            </Link>
            <Link href="/tentang/model" className="py-1.5 hover:underline">
              Cara AI menilai
            </Link>
            <Link href="/lacak" className="py-1.5 hover:underline">
              Lacak kiriman
            </Link>
            <Link href="/masuk" className="py-1.5 hover:underline">
              Masuk
            </Link>
          </nav>
        </div>
        {sources && <div className="flex flex-col gap-1.5 border-t border-line pt-6 text-[0.875rem] leading-snug text-ink-2">{sources}</div>}
        <p className="text-[0.875rem] text-ink-2">
          IT RUSH 2026 · Web Development · Universitas Bengkulu. Semua data di demo ini adalah simulasi.
        </p>
      </div>
    </footer>
  );
}
