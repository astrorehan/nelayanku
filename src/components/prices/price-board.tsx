"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icons/icon";
import { ButtonLink } from "@/components/ui/button";
import { Segmented } from "@/components/ui/choices";
import { TextField } from "@/components/ui/fields";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { Card, LedgerRow, Notice, Pill, SimulatedTag, SourceNote } from "@/components/ui/surface";
import { GRADE_LABEL } from "@/content/labels";
import { useDemoDatabase, useDemoNow } from "@/data/demo-data-provider";
import { DEMO_BUYER_ID } from "@/data/demo-identities";
import { localDateOf } from "@/data/demo-clock";
import {
  estimateCatchValue,
  offerVerdict,
  priceBoardForAllSpecies,
  PRICE_BOARD_GRADES,
  type PriceTrendPoint,
  type SpeciesPriceBoard,
} from "@/data/queries/price-board";
import type { SpeciesId } from "@/data/types";
import type { SellableGrade } from "@/domain/grade";
import type { BuyerKind, PriceRange } from "@/domain/pricing";
import { formatKg, formatNumber, formatPriceRange, formatRupiah, formatShortDate, formatSignedRupiah } from "@/lib/format";

export type PriceBoardAudience = "kub" | "fisher" | "buyer";

const PORT_COLOR = "var(--color-series-auction)";
const CONSUMER_COLOR = "var(--color-series-order)";
const MAX_DIGITS = 7;
const digitsOnly = (value: string) => value.replace(/\D/g, "").slice(0, MAX_DIGITS);
const dateAt = (date: string) => `${date}T12:00:00+07:00`;

function usePriceBoards(buyerKindOverride?: BuyerKind) {
  const db = useDemoDatabase();
  const now = useDemoNow();
  const buyerKind = buyerKindOverride ?? db.buyers.find((buyer) => buyer.id === DEMO_BUYER_ID)?.kind ?? "sppg";
  return priceBoardForAllSpecies(db, localDateOf(now), buyerKind);
}

function ChangePill({ board }: { board: SpeciesPriceBoard }) {
  const change = board.portChange;
  if (!change) {
    return null;
  }
  if (change.amount === 0) {
    return <Pill>sama dengan kemarin</Pill>;
  }
  const up = change.amount > 0;
  return (
    <Pill tone={up ? "success" : "warning"} icon="trendUp" className={clsx(!up && "[&_svg]:-scale-y-100")}>
      {formatSignedRupiah(change.amount)} dari kemarin
    </Pill>
  );
}

/** Compact one-line-per-species card for home pages. Links to `href` when given. */
export function PriceTicker({ href, buyerKind, className }: { href?: string; buyerKind?: BuyerKind; className?: string }) {
  const boards = usePriceBoards(buyerKind);
  const first = boards[0];
  return (
    <Card className={clsx("flex flex-col gap-1 p-4 sm:p-5", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="type-h3">Harga ikan hari ini</h2>
        <SimulatedTag />
      </div>
      <ul className="divide-y divide-line">
        {boards.map((board) => (
          <li key={board.speciesId} className="flex min-h-12 flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2">
            <span className="font-semibold">{board.speciesName}</span>
            <span className="flex items-baseline gap-3 text-[0.9375rem]">
              <span className="tabular">
                <b>{formatRupiah(board.port.pricePerKg)}</b> <span className="text-ink-2">TPI</span>
              </span>
              <span className="tabular text-ink-2">{formatRupiah(board.consumer.pricePerKg)} eceran</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <p className="text-[0.875rem] text-ink-2">
          Per kg, {first.port.source}, {formatShortDate(dateAt(first.port.date))}
        </p>
        {href && (
          <Link href={href} className="inline-flex min-h-12 items-center gap-1 font-semibold text-sea-deep hover:underline">
            Lihat papan harga
            <Icon name="chevronRight" size={18} />
          </Link>
        )}
      </div>
    </Card>
  );
}

/** Two-line chart of port and retail prices over the last 30 days. A trend, not a forecast. */
export function PriceTrendMini({ series, speciesName }: { series: PriceTrendPoint[]; speciesName: string }) {
  if (series.length < 2) {
    return <p className="text-ink-2">Belum cukup hari untuk menggambar tren.</p>;
  }
  const W = 600;
  const H = 160;
  const PAD = 8;
  const values = series.flatMap((point) => [point.portPricePerKg, point.consumerPricePerKg ?? point.portPricePerKg]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const x = (index: number) => PAD + (index / (series.length - 1)) * (W - PAD * 2);
  const y = (value: number) => PAD + (1 - (value - min) / span) * (H - PAD * 2);
  const path = (pick: (point: PriceTrendPoint) => number | null) =>
    series
      .flatMap((point, index) => {
        const value = pick(point);
        return value === null ? [] : [`${x(index).toFixed(1)} ${y(value).toFixed(1)}`];
      })
      .map((pair, index) => `${index === 0 ? "M" : "L"}${pair}`)
      .join(" ");
  const last = series[series.length - 1];

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.9375rem] text-ink-2">
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-0.5 w-4 rounded-full" style={{ background: PORT_COLOR }} />
          Harga TPI
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-0.5 w-4 rounded-full" style={{ background: CONSUMER_COLOR }} />
          Harga eceran
        </span>
        <span className="font-semibold text-ink">tren, bukan prediksi</span>
      </figcaption>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2">
        <div aria-hidden className="tabular flex flex-col justify-between py-1 text-[0.8125rem] text-ink-2">
          <span>{formatRupiah(max)}</span>
          <span>{formatRupiah(min)}</span>
        </div>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          role="img"
         
          aria-label={`Tren harga ${speciesName.toLowerCase()} 30 hari terakhir, dari ${formatRupiah(series[0].portPricePerKg)} ke ${formatRupiah(last.portPricePerKg)} di TPI`}
          className="h-40 w-full rounded-[12px] bg-paper"
        >
          {[0.25, 0.5, 0.75].map((share) => (
            <line key={share} x1={0} x2={W} y1={H * share} y2={H * share} stroke="var(--color-line)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          ))}
          <path d={path((point) => point.consumerPricePerKg)} fill="none" stroke={CONSUMER_COLOR} strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          <path d={path((point) => point.portPricePerKg)} fill="none" stroke={PORT_COLOR} strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <div className="flex justify-between pl-[4.5rem] text-[0.8125rem] text-ink-2">
        <span>{formatShortDate(dateAt(series[0].date))}</span>
        <span>{formatShortDate(dateAt(last.date))}</span>
      </div>
    </figure>
  );
}

function GradeTitle({ grade }: { grade: SellableGrade }) {
  return (
    <span className="flex items-center gap-3">
      <GradeStamp grade={grade} size="sm" />
      <span className="font-semibold">{GRADE_LABEL[grade]}</span>
    </span>
  );
}

function RangeTable({
  caption,
  ranges,
  grades,
  note,
}: {
  caption: string;
  ranges: Record<SellableGrade, PriceRange>;
  grades: readonly SellableGrade[];
  note?: (grade: SellableGrade) => string;
}) {
  return (
    <ul aria-label={caption} className="divide-y divide-line rounded-[16px] border border-line">
      {grades.map((grade) => (
        <li key={grade} className="flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2.5">
          <GradeTitle grade={grade} />
          <span className="text-right">
            <span className="tabular block font-semibold">{formatPriceRange(ranges[grade].low, ranges[grade].high)}/kg</span>
            {note && <span className="block text-[0.8125rem] text-ink-2">{note(grade)}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

function FisherCalculator({ board }: { board: SpeciesPriceBoard }) {
  const [grade, setGrade] = useState<SellableGrade>("A");
  const [kgDigits, setKgDigits] = useState("");
  const kg = Number(kgDigits);
  const estimate = kg > 0 ? estimateCatchValue(kg, grade, board) : null;
  return (
    <section aria-labelledby="calc-title" className="flex flex-col gap-4">
      <h3 id="calc-title" className="type-h3">
        Hitung perkiraan hasil
      </h3>
      <Segmented
        label="Mutu"
        value={grade}
        onChange={setGrade}
        options={PRICE_BOARD_GRADES.map((option) => ({ value: option, title: `${option} · ${GRADE_LABEL[option]}` }))}
      />
      <TextField
        label="Berapa kg"
        inputMode="numeric"
        autoComplete="off"
        suffix="kg"
        placeholder="contoh: 25"
        value={kgDigits ? formatNumber(kg) : ""}
        onChange={(event) => setKgDigits(digitsOnly(event.target.value))}
      />
      {estimate ? (
        <div className="flex flex-col gap-2.5 rounded-[16px] bg-sky-tint p-4" aria-live="polite">
          <LedgerRow strong label={`${formatKg(kg)} mutu ${grade}`} value={`${formatRupiah(estimate.fairLow)} – ${formatRupiah(estimate.fairHigh)}`} />
          <LedgerRow muted label="Kalau semuanya dijual di TPI" value={formatRupiah(estimate.portTotal)} />
          <p className="text-[0.9375rem] text-ink-2">
            {estimate.difference >= 0
              ? `Selisih sekitar ${formatRupiah(estimate.difference)} di atas harga TPI.`
              : `Mutu ${grade} bernilai sekitar ${formatRupiah(-estimate.difference)} di bawah harga TPI per ${formatKg(kg)}.`}{" "}
            Perkiraan, bukan angka bayar pasti.
          </p>
        </div>
      ) : (
        <p className="text-ink-2">Isi jumlah kg untuk melihat perkiraan Rp.</p>
      )}
    </section>
  );
}

const VERDICT = {
  below: { tone: "warning", title: "Di bawah rentang wajar", detail: "Nelayan bisa rugi dibanding harga yang pantas. Minta naikkan atau cari pembeli lain." },
  within: { tone: "success", title: "Dalam rentang wajar", detail: "Tawaran ini sepadan dengan harga TPI dan mutunya." },
  above: { tone: "info", title: "Di atas rentang wajar", detail: "Tawaran bagus untuk nelayan. Pastikan mutu dan jumlahnya sesuai janji." },
} as const;

function OfferChecker({ board }: { board: SpeciesPriceBoard }) {
  const [grade, setGrade] = useState<SellableGrade>("A");
  const [offerDigits, setOfferDigits] = useState("");
  const offer = Number(offerDigits);
  const range = board.fairFisherRange[grade];
  const verdict = offer > 0 ? VERDICT[offerVerdict(offer, range)] : null;
  return (
    <section aria-labelledby="offer-title" className="flex flex-col gap-4">
      <h3 id="offer-title" className="type-h3">
        Cek tawaran toke hari ini
      </h3>
      <Segmented
        label="Mutu yang ditawar"
        value={grade}
        onChange={setGrade}
        options={PRICE_BOARD_GRADES.map((option) => ({ value: option, title: `${option} · ${GRADE_LABEL[option]}` }))}
      />
      <TextField
        label="Tawaran per kg"
        inputMode="numeric"
        autoComplete="off"
        suffix="Rp/kg"
        placeholder={`contoh: ${formatNumber(range.low)}`}
        value={offerDigits ? formatNumber(offer) : ""}
        onChange={(event) => setOfferDigits(digitsOnly(event.target.value))}
      />
      {verdict ? (
        <Notice tone={verdict.tone} title={verdict.title}>
          {formatRupiah(offer)}/kg untuk mutu {grade}, rentang wajar {formatPriceRange(range.low, range.high)}/kg. {verdict.detail}
        </Notice>
      ) : (
        <p className="text-ink-2">Isi tawaran untuk membandingkan dengan rentang wajar mutu {grade}.</p>
      )}
    </section>
  );
}

function Headline({ board }: { board: SpeciesPriceBoard }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Card className="flex flex-col gap-1.5 p-5">
        <p className="flex items-center gap-2 font-semibold text-ink-2">
          Harga TPI hari ini <SimulatedTag />
        </p>
        <p className="type-num-l tabular">{formatRupiah(board.port.pricePerKg)}<span className="text-[1rem] text-ink-2">/kg</span></p>
        <div>
          <ChangePill board={board} />
        </div>
        <p className="text-[0.875rem] text-ink-2">
          {board.port.source}, {board.port.location}, {formatShortDate(dateAt(board.port.date))}. Rata-rata 7 hari {formatRupiah(board.portAverage.pricePerKg)}.
        </p>
      </Card>
      <Card className="flex flex-col gap-1.5 p-5">
        <p className="flex items-center gap-2 font-semibold text-ink-2">
          Harga eceran <SimulatedTag />
        </p>
        <p className="type-num-l tabular">{formatRupiah(board.consumer.pricePerKg)}<span className="text-[1rem] text-ink-2">/kg</span></p>
        <p className="text-[0.875rem] text-ink-2">
          {board.consumer.source}, {board.consumer.location}, {formatShortDate(dateAt(board.consumer.date))}.
        </p>
      </Card>
    </div>
  );
}

const BUYER_KIND_LABEL: Record<BuyerKind, string> = {
  sppg: "dapur SPPG",
  restaurant: "restoran",
  hotel: "hotel",
  catering: "katering",
};

function AudiencePanel({ audience, board }: { audience: PriceBoardAudience; board: SpeciesPriceBoard }) {
  if (audience === "fisher") {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <section aria-labelledby="fair-title" className="flex flex-col gap-3">
          <h3 id="fair-title" className="type-h3">
            Harga pantas untuk Bapak/Ibu
          </h3>
          <RangeTable caption="Harga pantas nelayan per mutu" ranges={board.fairFisherRange} grades={PRICE_BOARD_GRADES} note={(grade) => (grade === "C" ? "jadi bahan olahan" : "")} />
          <SourceNote simulated>Dihitung dari rata-rata harga TPI 7 hari, lalu disesuaikan mutu.</SourceNote>
        </section>
        <FisherCalculator board={board} />
      </div>
    );
  }
  if (audience === "kub") {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <section aria-labelledby="fair-title" className="flex flex-col gap-3">
          <h3 id="fair-title" className="type-h3">
            Rentang wajar harga ke nelayan
          </h3>
          <RangeTable caption="Rentang wajar harga nelayan per mutu" ranges={board.fairFisherRange} grades={PRICE_BOARD_GRADES} />
          <SourceNote simulated>
            Rata-rata TPI 7 hari ({formatShortDate(dateAt(board.portAverage.fromDate))} – {formatShortDate(dateAt(board.portAverage.toDate))}) dikali faktor mutu, rentang −5% sampai +10%.
          </SourceNote>
        </section>
        <OfferChecker board={board} />
      </div>
    );
  }
  return (
    <section aria-labelledby="buyer-range-title" className="flex max-w-2xl flex-col gap-3">
      <h3 id="buyer-range-title" className="type-h3">
        Harga yang disarankan untuk {BUYER_KIND_LABEL[board.buyerKind]}
      </h3>
      <RangeTable
        caption="Harga saran pembeli per mutu"
        ranges={board.suggestedBuyerRange}
        grades={["A", "B"]}
        note={(grade) => (grade === "A" ? "skor 8 ke atas" : "skor 7 ke atas")}
      />
      <SourceNote simulated>
        Batas bawah menutup es, angkut, dan kas KUB supaya nelayan tetap menerima harga pantas. Batas atas 85% harga eceran. Bukan harga yang dipaksakan.
      </SourceNote>
      <ButtonLink href={`/pembeli/pesan?ikan=${board.speciesId}`} size="lg" icon="send" className="self-start">
        Pesan {board.speciesName.toLowerCase()}
      </ButtonLink>
    </section>
  );
}

/**
 * Shared price board. `audience` decides the grade section: fisher gets a catch calculator,
 * kub gets an offer checker, buyer gets suggested prices and an order link.
 */
export function PriceBoard({
  audience,
  initialSpeciesId = "tongkol",
  buyerKind,
  className,
}: {
  audience: PriceBoardAudience;
  initialSpeciesId?: SpeciesId;
  buyerKind?: BuyerKind;
  className?: string;
}) {
  const boards = usePriceBoards(buyerKind);
  const [speciesId, setSpeciesId] = useState<SpeciesId>(initialSpeciesId);
  const board = boards.find((entry) => entry.speciesId === speciesId) ?? boards[0];

  return (
    <div className={clsx("flex flex-col gap-6", className)}>
      <Segmented
        label="Jenis ikan"
        value={board.speciesId}
        onChange={setSpeciesId}
        options={boards.map((entry) => ({ value: entry.speciesId, title: entry.speciesName }))}
      />
      <Headline board={board} />
      <AudiencePanel key={`${audience}-${board.speciesId}`} audience={audience} board={board} />
      <Card className="flex flex-col gap-3 p-5">
        <h3 className="type-h3">30 hari terakhir</h3>
        <PriceTrendMini series={board.series} speciesName={board.speciesName} />
      </Card>
      <SourceNote simulated>
        Angka di halaman ini data contoh bentukan tim, mengikuti pola {board.port.source} dan {board.consumer.source}. Bukan harga pasar sebenarnya.
      </SourceNote>
    </div>
  );
}
