import clsx from "clsx";
import Image from "next/image";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons/icon";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { GRADE_MEANING } from "@/content/labels";
import { GRADES } from "@/domain/grade";
import { SimulatedTag } from "@/components/ui/surface";
import { priceBreakdown, type BreakdownLineKey } from "@/domain/pricing";
import { formatRupiah } from "@/lib/format";
import { EXAMPLE_SPPG_BUYER_PRICE } from "@/content/market-facts";

const breakdown = priceBreakdown(EXAMPLE_SPPG_BUYER_PRICE, "sppg");
const fisherPrice = breakdown.fisherReceivesPerKg;

const SPLIT_LABEL: Partial<Record<BreakdownLineKey, string>> = {
  ice_and_transport: "Es dan angkut",
  kub_fund: "Kas KUB",
  shrinkage_reserve: "Cadangan susut",
};

const SPLIT = [
  { key: "fisher", label: "Nelayan", amount: fisherPrice, tone: "bg-sea" },
  ...breakdown.lines
    .filter((line) => SPLIT_LABEL[line.key] && line.amountPerKg > 0)
    .map((line, index) => ({
      key: line.key,
      label: SPLIT_LABEL[line.key]!,
      amount: line.amountPerKg,
      tone: ["bg-[#6f98f4]", "bg-gold", "bg-line-strong"][index],
    })),
];

function OrderSlip() {
  return (
    <div className="rounded-[18px] bg-surface p-5 shadow-raised">
      <div className="flex items-center justify-between gap-3 text-sm text-ink-2">
        <span className="truncate">Dapur SPPG Kampung Melayu</span>
        <span className="type-code shrink-0 text-xs">TGK-A-0511</span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <GradeStamp grade="A" size="sm" />
          <span className="type-h2">Tongkol</span>
        </div>
        <span className="type-money text-[1.75rem]">
          40<span className="ml-1 text-base text-ink-2">kg</span>
        </span>
      </div>
      <p className="mt-4 rounded-full bg-sky-tint px-3 py-1.5 text-center text-sm font-semibold text-sea-deep">
        Kirim besok pukul 08.00
      </p>
    </div>
  );
}

/* Saat kapal mendarat: foto dermaga dengan lingkar fokus di mata ikan, kartu mutu menempel di atasnya */
function DockMoment() {
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-ink [--eye-x:20%] lg:[--eye-x:13.3%]">
      <div className="relative aspect-square lg:aspect-[3/2]">
        <Image
          src="/images/kepala-tongkol.webp"
          alt="Ilustrasi kepala tiga ikan tongkol di atas es dalam peti"
          fill
          unoptimized
          sizes="(min-width: 1024px) 40vw, 34rem"
          className="object-cover object-left"
        />
        <span
          aria-hidden
          className="absolute size-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-white lg:size-16"
          style={{ left: "var(--eye-x)", top: "56.2%" }}
        />
        <span
          aria-hidden
          className="absolute -translate-y-1/2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink backdrop-blur"
          style={{ left: "calc(var(--eye-x) + 2.5rem)", top: "56.2%" }}
        >
          Foto mata
        </span>
      </div>
      <div className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-[20px] bg-surface p-3 pr-4 shadow-floating sm:inset-x-4 sm:bottom-4">
        <GradeStamp grade="A" size="md" />
        <div className="flex min-w-0 flex-col">
          <p className="flex items-baseline gap-1.5">
            <span className="type-money text-[1.625rem]">8,4</span>
            <span className="text-sm text-ink-2">dari 9</span>
          </p>
          <p className="truncate text-sm text-ink-2">
            Mata, insang, bau, tekstur
          </p>
        </div>
      </div>
    </div>
  );
}

function RupiahSplit() {
  return (
    <div className="rounded-[18px] bg-surface p-5 shadow-raised">
      <p className="flex items-baseline justify-between gap-3 text-sm text-ink-2">
        <span>Dibayar pembeli per kg</span>
        <span className="type-money text-base text-ink">
          {formatRupiah(EXAMPLE_SPPG_BUYER_PRICE)}
        </span>
      </p>
      <div
        aria-hidden
        className="mt-4 flex h-3 gap-0.5 overflow-hidden rounded-full"
      >
        {SPLIT.map((part) => (
          <span
            key={part.key}
            className={part.tone}
            style={{ flexGrow: part.amount }}
          />
        ))}
      </div>
      <ul className="mt-4 flex flex-col gap-1.5 text-sm">
        {SPLIT.map((part) => (
          <li
            key={part.key}
            className={
              part.key === "fisher"
                ? "flex items-center gap-2 font-semibold"
                : "flex items-center gap-2 text-ink-2"
            }
          >
            <span
              aria-hidden
              className={`size-2 shrink-0 rounded-full ${part.tone}`}
            />
            <span className="flex-1">{part.label}</span>
            <span className="tabular">{formatRupiah(part.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const STEPS: Array<{
  day: string;
  time: string;
  role: string;
  icon: IconName;
  title: string;
  body: string;
  visual: ReactNode;
  framed: boolean;
}> = [
  {
    day: "Rabu",
    time: "19.40",
    role: "Dicatat pembeli",
    icon: "coolBox",
    title: "Pesanan sudah ada",
    body: "Dapur SPPG memesan 40 kg tongkol untuk besok pukul 08.00. KUB tahu jumlah dan mutu yang dibutuhkan sebelum kapal mendarat.",
    visual: <OrderSlip />,
    framed: true,
  },
  {
    day: "Kamis",
    time: "05.05",
    role: "Dicatat operator KUB",
    icon: "scale",
    title: "Mutu ikut tercatat",
    body: "Ikan ditimbang, mata dan insang difoto, lalu bau dan tekstur dinilai operator. Empat parameter menjadi satu catatan mutu, bergaya SNI 2729.",
    visual: <DockMoment />,
    framed: false,
  },
  {
    day: "Kamis",
    time: "08.00",
    role: "Dibaca nelayan",
    icon: "boat",
    title: "Bagian setiap orang jelas",
    body: `Biaya es, angkut, kas KUB, dan bagian nelayan ditulis terpisah. 18 kg tongkol berarti ${formatRupiah(18 * fisherPrice)} untuk nelayan. Cicilan hanya dipotong setelah nelayan menyetujuinya.`,
    visual: <RupiahSplit />,
    framed: true,
  },
];

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="scroll-mt-20">
      <div className="mx-auto flex max-w-[84rem] flex-col px-5 py-16 sm:px-8 lg:py-24">
        <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-line pb-4 text-sm md:grid-cols-3">
          <p className="font-semibold text-sea">Cara kerja</p>
          <p className="hidden text-center text-ink-2 md:block">
            Rabu 19.40 sampai Kamis 08.00
          </p>
          <p className="flex items-center justify-end gap-2 text-ink-2">
            <span className="hidden sm:inline">Cerita dan angka contoh</span>
            <SimulatedTag />
          </p>
        </div>

        <header className="mx-auto mt-12 flex max-w-3xl flex-col items-center gap-4 text-center lg:mt-16">
          <h2 className="type-title">
            Satu pagi di dermaga.
            <br />
            Semua ada catatannya.
          </h2>
          <p className="max-w-[30rem] text-ink-2 lg:text-lg">
            Tiga catatan, ditulis tiga orang yang berbeda. Pembeli, KUB, dan
            nelayan membaca catatan yang sama.
          </p>
        </header>

        <ol className="relative mt-12 grid gap-10 pl-9 before:absolute before:bottom-6 before:left-[11px] before:top-3 before:w-px before:bg-line-strong/60 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)] lg:grid-rows-[auto_auto_auto] lg:gap-y-0 lg:pl-0 lg:before:bottom-auto lg:before:left-0 lg:before:right-0 lg:before:top-[11px] lg:before:h-px lg:before:w-auto lg:mt-16 lg:gap-x-8">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="relative flex min-w-0 max-w-[34rem] flex-col lg:max-w-none lg:row-span-3 lg:grid lg:grid-cols-[minmax(0,1fr)] lg:grid-rows-subgrid"
            >
              <div>
              <span
                aria-hidden
                className={clsx(
                  "absolute -left-9 top-0 size-[23px] rounded-full border-[5px] border-surface lg:static lg:block",
                  index === 1 ? "bg-gold" : "bg-sea",
                )}
              />
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 lg:mt-5">
                <p className="type-h2 tabular">
                  <span className="sr-only">Pukul </span>
                  {step.time}
                </p>
                <p className="text-ink-2">{step.day}</p>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-sea">
                  <Icon name={step.icon} size={16} />
                  {step.role}
                </p>
              </div>
              </div>
              <div
                className={clsx(
                  "mt-5",
                  step.framed &&
                    "flex flex-col justify-center rounded-[28px] bg-sky-tint p-6 sm:p-8",
                )}
              >
                {step.visual}
              </div>
              <div className="flex flex-col gap-2 pt-6">
                <h3 className="type-h2">{step.title}</h3>
                <p className="text-ink-2">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <dl className="mt-14 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          {GRADES.map((grade) => (
            <div
              key={grade}
              className="flex items-center gap-3 rounded-[16px] border border-line py-2 pl-2 pr-5"
            >
              <dt>
                <GradeStamp grade={grade} size="sm" />
              </dt>
              <dd className="text-sm leading-snug text-ink-2">
                {GRADE_MEANING[grade]}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
