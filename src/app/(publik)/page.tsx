import { HonestAi } from "@/components/landing/honest-ai";
import Link from "next/link";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PriceLadder } from "@/components/landing/price-ladder";
import { WhoPays } from "@/components/landing/who-pays";
import { ButtonLink } from "@/components/ui/button";
import { LANDING_SOURCES } from "@/content/market-facts";

export default function LandingPage() {
  return (
    <main id="main-content" className="bg-surface">
      <section className="px-3 sm:px-5 lg:px-6">
        <div className="dawn-sky relative mx-auto flex max-w-[84rem] flex-col items-center rounded-[32px] px-4 pt-12 text-center sm:px-8 sm:pt-16 lg:rounded-[40px] lg:pt-20">
          <h1 className="type-display text-ink">
            <span className="block">Ikan jelas asalnya.</span>
            <span className="block">Nelayan jelas bagiannya.</span>
          </h1>
          <p className="mt-6 max-w-[34rem] text-[1.0625rem] leading-relaxed text-ink-2 lg:text-lg">
            Buku kerja KUB nelayan di Pulau Baai, dari timbang tangkapan
            sampai bagi hasil. Nilai mutu ikan, penuhi pesanan dapur, dan
            catat setiap rupiah untuk nelayan.
          </p>
          <div className="mt-8 flex w-full flex-col items-stretch gap-2.5 sm:w-auto sm:flex-row sm:items-center">
            <ButtonLink href="/coba" size="lg" icon="eye">
              Coba nilai kesegaran ikan
            </ButtonLink>
            <ButtonLink href="/masuk" size="lg" variant="secondary">
              Masuk sebagai…
            </ButtonLink>
          </div>
          <p className="mt-4 text-sm text-ink-2">
            Tanpa daftar akun. Foto contoh dengan hasil simulasi.
          </p>
          <Link href="/juri" className="mt-2 inline-flex min-h-12 items-center font-semibold text-sea-deep underline underline-offset-4">Coba dalam 5 menit · panduan juri →</Link>
          <div className="relative -mb-[clamp(5rem,15vw,11.5rem)] mt-8 w-full">
            <PriceLadder />
          </div>
          <span className="absolute bottom-4 right-6 hidden text-xs text-ink-2 lg:block">
            Foto ilustrasi
          </span>
        </div>
      </section>
      <div aria-hidden className="h-[clamp(5rem,15vw,11.5rem)]" />
      <HowItWorks />
      <WhoPays />
      <HonestAi />
      <section aria-label="Sumber angka" className="mx-auto mt-16 max-w-[84rem] px-5 pb-10 sm:px-8">
        <div className="flex flex-col gap-1.5 border-t border-line pt-6 text-[0.875rem] leading-snug text-ink-2">
          {LANDING_SOURCES.map((source, index) => (
            <p key={source} id={`sumber-${index + 1}`} className="scroll-mt-24">
              {index + 1}. {source}
            </p>
          ))}
        </div>
      </section>
    </main>
  );
}
