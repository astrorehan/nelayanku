import { HonestAi } from "@/components/landing/honest-ai";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PriceLadder } from "@/components/landing/price-ladder";
import { WhoPays } from "@/components/landing/who-pays";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { ButtonLink } from "@/components/ui/button";
import { LANDING_SOURCES } from "@/content/market-facts";

export default function LandingPage() {
  return (
    <>
      <PublicHeader ctaMode="after-hero" />
      <main id="main-content">
        <section className="mx-auto grid max-w-[76rem] grid-cols-1 items-center gap-10 px-5 pb-16 pt-8 sm:px-8 sm:pt-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16 lg:pb-20 lg:pt-12">
          <div className="flex min-w-0 flex-col items-start">
            <p className="mb-6 flex items-center gap-3 text-sm text-ink-2">
              <span className="docket-eye" aria-hidden />
              Buku kerja nelayan · Pulau Baai
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.375rem,1.3rem+2.7vw,3.75rem)] font-medium leading-[1.08] tracking-[-0.035em] [text-wrap:initial]">
              Ikan jelas asalnya.
              <br />
              <span className="text-ink-2">
                Nelayan jelas
                <br />
                bagiannya.
              </span>
            </h1>
            <p className="mt-6 max-w-[29rem] text-[1.0625rem] leading-relaxed text-ink-2 lg:text-lg">
              Buku kerja KUB, dari timbang tangkapan sampai bagi hasil. Nilai
              mutu ikan, penuhi pesanan dapur, dan catat setiap rupiah untuk
              nelayan.
            </p>
            <div className="mt-8 flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-start">
              <ButtonLink href="/coba" size="lg" iconAfter="arrowRight">
                Coba nilai kesegaran ikan
              </ButtonLink>
              <ButtonLink
                href="/masuk"
                size="md"
                variant="ghost"
                className="justify-start px-0 font-normal underline decoration-line-strong underline-offset-4"
              >
                Masuk sebagai…
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm text-ink-2">
              Tanpa daftar akun · Foto contoh dengan hasil simulasi
            </p>
            <div className="mt-10 hidden items-center gap-4 border-t border-line pt-5 lg:flex">
              <span className="record-number">01 Timbang</span>
              <span aria-hidden className="h-px w-5 bg-line-strong" />
              <span className="record-number">02 Nilai</span>
              <span aria-hidden className="h-px w-5 bg-line-strong" />
              <span className="record-number">03 Bagi hasil</span>
            </div>
          </div>
          <PriceLadder />
        </section>
        <HowItWorks />
        <WhoPays />
        <HonestAi />
      </main>
      <PublicFooter
        sources={LANDING_SOURCES.map((source, index) => (
          <p key={source} id={`sumber-${index + 1}`} className="scroll-mt-24">
            {index + 1}. {source}
          </p>
        ))}
      />
    </>
  );
}
