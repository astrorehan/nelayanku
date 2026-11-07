import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <PublicHeader ctaMode="never" />
      <main
        id="main-content"
        className="mx-auto flex max-w-xl flex-col gap-5 px-4 py-16"
      >
        <p className="type-code text-ink-2">404</p>
        <h1 className="type-title">Halaman tidak ditemukan</h1>
        <p className="text-ink-2">
          Periksa tautannya, atau pilih halaman dari peta situs di bawah
        </p>
        <ButtonLink href="/" icon="arrowLeft" className="self-start">
          Ke halaman depan
        </ButtonLink>
      </main>
      <PublicFooter />
    </>
  );
}
