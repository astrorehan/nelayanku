import { ButtonLink } from "@/components/ui/button";

/** Pita ajakan sebelum kaki halaman: tiga cara mencoba tanpa daftar akun. */
export function ClosingBand() {
  return (
    <section
      aria-labelledby="ajakan"
      className="px-3 pb-12 sm:px-5 lg:px-6 lg:pb-16"
    >
      <div className="dawn-sky mx-auto flex max-w-[84rem] flex-col items-center gap-6 rounded-[32px] px-5 py-12 text-center sm:px-8 lg:rounded-[40px] lg:py-16">
        <h2 id="ajakan" className="type-title max-w-2xl text-ink">
          Lihat sendiri, tanpa daftar akun.
        </h2>
        <p className="max-w-[32rem] text-ink-2 lg:text-lg">
          Semua data di demo ini contoh yang tersimpan di browser Anda. Pilih
          jalan yang paling cepat.
        </p>
        <div className="flex w-full flex-col items-stretch gap-2.5 sm:w-auto sm:flex-row sm:items-center">
          <ButtonLink href="/juri" size="lg" icon="arrowRight">
            Ikuti tur juri
          </ButtonLink>
          <ButtonLink href="/coba" size="lg" variant="secondary" icon="eye">
            Coba nilai ikan
          </ButtonLink>
          <ButtonLink
            href="/lacak/CKL-B-0511"
            size="lg"
            variant="secondary"
            icon="qr"
          >
            Lacak contoh kiriman
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
