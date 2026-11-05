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
      <main>
        <section className="mx-auto grid max-w-[76rem] grid-cols-1 items-center gap-10 px-4 pb-14 pt-8 sm:px-6 sm:pt-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-14 lg:px-8 lg:pb-20 lg:pt-14">
          <div className="flex flex-col gap-6">
            <p className="type-eyebrow">Harga tongkol per kg · Pulau Baai, Bengkulu</p>
            <h1 className="type-display text-[clamp(2.375rem,1.35rem+2.6vw,3.25rem)]">
              <span className="block">
                Rp13.000 <span className="whitespace-nowrap">di dermaga</span>
              </span>
              <span className="block">
                Rp30.000 <span className="whitespace-nowrap">di pengecer</span>
              </span>
            </h1>
            <p className="type-lead max-w-[34rem] text-ink-2">
              Nelayanku membantu KUB nelayan kecil membuktikan mutu ikan di dermaga, lalu menjualnya ke dapur SPPG dan restoran
              yang sudah memesan sehari sebelumnya.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/coba" size="xl" icon="eye">
                Coba nilai kesegaran ikan
              </ButtonLink>
              <ButtonLink href="/masuk" size="xl" variant="secondary">
                Masuk sebagai…
              </ButtonLink>
            </div>
            <p className="text-ink-2">Tanpa daftar akun · Foto contoh dengan hasil simulasi</p>
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
