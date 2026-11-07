import { Logo, WORDMARK_PATH } from "@/components/brand/logo";
import { SiteMap } from "@/components/layout/site-map";

export function PublicFooter() {
  return (
    <footer className="overflow-hidden border-t border-line bg-surface">
      <div className="mx-auto flex max-w-[84rem] flex-col gap-10 px-5 pt-14 sm:px-8">
        <div className="flex max-w-sm flex-col gap-4">
          <Logo className="h-7 w-auto self-start" />
          <p className="text-ink-2">
            Ikan nelayan kecil, mutu terbukti, dibayar adil, tanpa ada yang
            terbuang.
          </p>
        </div>
        <SiteMap />
        <p className="border-t border-line pt-6 text-[0.875rem] text-ink-2">
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
