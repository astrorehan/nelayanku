import { Icon, type IconName } from "@/components/icons/icon";
import { Reveal } from "@/components/motion/reveal";
import { breakEvenBuyerPrice } from "@/domain/pricing";
import { formatRupiah } from "@/lib/format";
import { PORT_AUCTION_TONGKOL_PRICE } from "@/content/market-facts";

const sppgBreakEven = breakEvenBuyerPrice(PORT_AUCTION_TONGKOL_PRICE.value, "sppg");

const PAYERS: Array<{ who: string; what: string; source?: number }> = [
  {
    who: "Pembeli institusi",
    what: "Biaya layanan 2% sudah termasuk harga. Untuk dapur SPPG Rp0, karena aturan BGN melarang komisi.",
    source: 3,
  },
  { who: "KUB dan koperasi", what: "Langganan Pro untuk rekap otomatis, label kiriman, dan laporan ke mitra." },
  {
    who: "Nelayan dan pengolah",
    what: `Tidak membayar apa pun. Nelayan sudah untung kalau dapur SPPG membayar ${formatRupiah(sppgBreakEven)}/kg atau lebih.`,
    source: 2,
  },
];

const NOT_BUILT: Array<{ icon: IconName; text: string }> = [
  { icon: "coins", text: "Pembayaran sungguhan. Di demo ini pembayaran masih simulasi." },
  { icon: "ice", text: "Sensor suhu. Rantai dingin dicatat lewat checklist es dan jam segar." },
  { icon: "fish", text: "Menebak jenis ikan. Operator yang memilih jenisnya." },
  { icon: "boat", text: 'Jualan ke konsumen umum, dan klaim "siap ekspor".' },
  { icon: "ledger", text: "Meminjamkan uang. Buku kas hanya mencatat utang yang sudah ada." },
];

export function WhoPays() {
  return (
    <section id="siapa-membayar" className="scroll-mt-20">
      <div className="mx-auto grid max-w-[76rem] grid-cols-1 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:px-8 lg:py-24">
        <Reveal className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <p className="type-eyebrow">Siapa membayar</p>
            <h2 className="type-title">Pembeli dan KUB membayar. Nelayan tidak.</h2>
          </div>
          <dl className="flex flex-col">
            {PAYERS.map((payer) => (
              <div key={payer.who} className="grid grid-cols-1 gap-1 border-t border-line py-5 first:border-t-0 first:pt-0 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6">
                <dt className="type-h3">{payer.who}</dt>
                <dd className="text-ink-2">
                  {payer.what}
                  {payer.source && (
                    <a href={`#sumber-${payer.source}`} className="ml-0.5 align-super text-[0.75rem] font-bold no-underline hover:text-ink">
                      {payer.source}
                    </a>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
        <Reveal delay={0.1}>
          <aside className="flex flex-col gap-5 rounded-[24px] border border-line bg-paper-deep p-6 sm:p-7">
            <div className="flex flex-col gap-2">
              <p className="type-eyebrow">Jujur soal batas</p>
              <h3 className="type-h2">Yang sengaja belum kami kerjakan</h3>
            </div>
            <ul className="flex flex-col gap-3.5">
              {NOT_BUILT.map((item) => (
                <li key={item.text} className="flex gap-3">
                  <Icon name={item.icon} size={22} className="mt-0.5 shrink-0 text-ink-2" />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </aside>
        </Reveal>
      </div>
    </section>
  );
}
