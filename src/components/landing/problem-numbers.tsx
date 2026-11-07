import { PROBLEM_FACTS } from "@/content/market-facts";

/**
 * Baris angka masalah di bawah hero. Setiap angka punya nomor sumber yang
 * menaut ke daftar sumber di akhir halaman.
 */
export function ProblemNumbers() {
  return (
    <section
      aria-labelledby="masalah-angka"
      className="mx-auto max-w-[84rem] px-5 pt-14 sm:px-8 lg:pt-20"
    >
      <div className="grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-2">
          <p className="type-eyebrow">Masalah dalam angka</p>
          <h2 id="masalah-angka" className="type-h1 max-w-[19rem]">
            Nelayan kecil menanggung yang paling berat.
          </h2>
        </div>
        <ol className="grid gap-y-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-0">
          {PROBLEM_FACTS.map((fact) => (
            <li
              key={fact.id}
              className="grid grid-cols-[7.25rem_minmax(0,1fr)] gap-x-4 border-t border-line pt-5 sm:grid-cols-1 sm:gap-y-3 sm:pr-6 lg:border-l lg:border-t-0 lg:py-1 lg:pl-6 lg:pr-4 lg:first:border-l-0 lg:first:pl-0"
            >
              <p className="type-num-l whitespace-nowrap text-sea-deep sm:type-num-xl">
                {fact.figure}
              </p>
              <div className="flex min-w-0 flex-col gap-1.5">
                <p className="font-semibold leading-snug">
                  {fact.label}
                  <a
                    href={`#sumber-${fact.sourceNo}`}
                    aria-label={`Sumber ${fact.sourceNo}`}
                    className="ml-1 inline-flex align-super text-xs font-semibold text-ink-3 underline underline-offset-2 hover:text-sea"
                  >
                    {fact.sourceNo}
                  </a>
                </p>
                <p className="text-[0.9375rem] leading-snug text-ink-2">
                  {fact.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
