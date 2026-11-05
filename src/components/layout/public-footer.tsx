import Link from "next/link";
import type { ReactNode } from "react";
import { Logo, WORDMARK_PATH } from "@/components/brand/logo";

const FOOTER_LINKS = [
  { href: "/coba", label: "Coba nilai ikan" },
  { href: "/tentang/model", label: "Cara AI menilai" },
  { href: "/lacak", label: "Lacak kiriman" },
  { href: "/masuk", label: "Masuk" },
];

export function PublicFooter({ sources }: { sources?: ReactNode }) {
  return (
    <footer className="overflow-hidden border-t border-line bg-surface">
      <div className="mx-auto flex max-w-[84rem] flex-col gap-10 px-5 pt-14 sm:px-8">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-start">
          <div className="flex max-w-sm flex-col gap-4">
            <Logo className="h-7 w-auto self-start" />
            <p className="text-ink-2">
              Ikan nelayan kecil, mutu terbukti, dibayar adil, tanpa ada yang
              terbuang.
            </p>
          </div>
          <nav
            aria-label="Tautan kaki"
            className="grid grid-cols-2 gap-x-10 gap-y-1 font-semibold sm:flex sm:gap-2"
          >
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full py-2 transition-colors hover:text-sea sm:px-3.5"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        {sources && (
          <div className="flex flex-col gap-1.5 border-t border-line pt-6 text-[0.875rem] leading-snug text-ink-2">
            {sources}
          </div>
        )}
        <p className="text-[0.875rem] text-ink-2">
          IT RUSH 2026, Web Development, Universitas Bengkulu. Semua data di
          demo ini adalah simulasi.
        </p>
      </div>
      <svg
        aria-hidden
        viewBox="128 0 470 87"
        className="hull-wordmark mx-auto -mb-[3.5%] mt-6 block w-full max-w-[84rem] px-3 sm:px-6"
      >
        <path fill="currentColor" d={WORDMARK_PATH} />
      </svg>
    </footer>
  );
}
