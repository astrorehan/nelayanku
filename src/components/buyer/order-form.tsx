"use client";

import { useState } from "react";
import { PriceBreakdownList } from "@/components/batch/price-breakdown";
import { SpeciesPicker } from "@/components/fish/species-picker";
import { Icon } from "@/components/icons/icon";
import { RoleHeader } from "@/components/layout/role-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { ChoiceGroup, Segmented } from "@/components/ui/choices";
import { TextField } from "@/components/ui/fields";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { Sheet } from "@/components/ui/overlays";
import { Card, LedgerRow, Notice, SourceNote } from "@/components/ui/surface";
import { GRADE_LABEL } from "@/content/labels";
import { useDemoDatabase, useDemoNow, useRepository } from "@/data/demo-data-provider";
import { demoTime } from "@/data/demo-clock";
import { DEMO_BUYER_ID } from "@/data/demo-identities";
import { buyerPriceGuide, DELIVERY_TIMES, nextDeliveryDate, orderCutoff } from "@/data/queries/ordering";
import type { Order, SpeciesId } from "@/data/types";
import { priceBreakdown } from "@/domain/pricing";
import { formatClock, formatDayDate, formatDuration, formatKg, formatNumber, formatPriceRange, formatRupiah, formatShortDate } from "@/lib/format";

type OrderGrade = "A" | "B";
type DeliveryTime = (typeof DELIVERY_TIMES)[number];

const QUICK_KG = [20, 30, 40, 50];
const DOWN_PAYMENT_RATE = 0.3;
const MAX_DIGITS = 6;

const digitsOnly = (value: string) => value.replace(/\D/g, "").slice(0, MAX_DIGITS);

function formHint(fields: { speciesId: SpeciesId | null; grade: OrderGrade | null; kg: number; time: DeliveryTime | null; price: number; address: string }) {
  if (!fields.speciesId) {
    return "Pilih jenis ikan dulu";
  }
  if (!fields.grade) {
    return "Pilih mutu paling rendah dulu";
  }
  if (fields.kg <= 0) {
    return "Isi jumlah kg dulu";
  }
  if (!fields.time) {
    return "Pilih jam kirim dulu";
  }
  if (!fields.address.trim()) {
    return "Isi alamat dapur dulu";
  }
  return fields.price > 0 ? null : "Isi harga per kg dulu";
}

function PlacedOrder({ order, speciesName, onAnother }: { order: Order; speciesName: string; onAnother: () => void }) {
  return (
    <Card emphasis className="flex flex-col gap-4 p-6">
      <p className="flex items-center gap-3 type-h2">
        <span className="grid size-9 place-items-center rounded-full bg-success text-white">
          <Icon name="check" size={20} strokeWidth={3} />
        </span>
        Pesanan terkirim
      </p>
      <p className="type-h3">
        {speciesName} {order.minimumGrade} · {formatKg(order.targetKg)} · {formatDayDate(order.deliverAt)}, {formatClock(order.deliverAt)}
      </p>
      <p className="type-lead text-ink-2">KUB mengisinya dari tangkapan besok pagi. Isinya bisa dilihat bertambah di halaman Pesanan.</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <ButtonLink href="/pembeli" size="lg" icon="arrowLeft">
          Ke halaman Pesanan
        </ButtonLink>
        <Button variant="quiet" size="lg" icon="plus" onClick={onAnother}>
          Pesan jenis lain
        </Button>
      </div>
    </Card>
  );
}

export function OrderForm() {
  const db = useDemoDatabase();
  const now = useDemoNow();
  const repository = useRepository();
  const buyer = db.buyers.find((candidate) => candidate.id === DEMO_BUYER_ID)!;
  const [speciesId, setSpeciesId] = useState<SpeciesId | null>(null);
  const [grade, setGrade] = useState<OrderGrade | null>(null);
  const [kgDigits, setKgDigits] = useState("");
  const [time, setTime] = useState<DeliveryTime | null>(null);
  const [address, setAddress] = useState(buyer.address);
  const [priceDigits, setPriceDigits] = useState("");
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Order | null>(null);
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  const kg = Number(kgDigits);
  const price = Number(priceDigits);
  const deliveryDate = nextDeliveryDate(now);
  const cutoff = orderCutoff(now);
  const minutesToCutoff = Math.max(0, Math.round((cutoff.getTime() - now.getTime()) / 60_000));
  const guide = speciesId && grade ? buyerPriceGuide(db, { buyerId: buyer.id, buyerKind: buyer.kind, speciesId, grade, now }) : null;
  const breakdown = price > 0 ? priceBreakdown(price, buyer.kind) : null;
  const total = kg * price;
  const hint = formHint({ speciesId, grade, kg, time, price, address });

  const submit = async () => {
    if (hint || !speciesId || !grade || !time) {
      return;
    }
    setBusy(true);
    setFailure(null);
    try {
      const order = await repository.placeOrder({
        buyerId: buyer.id,
        speciesId,
        minimumGrade: grade,
        targetKg: kg,
        pricePerKg: price,
        deliverAt: demoTime(deliveryDate, time),
        address: address.trim(),
      });
      setPlaced(order);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setFailure("Pesanan belum terkirim. Coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  const startAnother = () => {
    setPlaced(null);
    setSpeciesId(null);
    setGrade(null);
    setKgDigits("");
    setTime(null);
    setPriceDigits("");
  };

  const summary = (
    <div className="flex flex-col gap-3">
      <LedgerRow label={kg > 0 && price > 0 ? `${formatKg(kg)} × ${formatRupiah(price)}` : "Total"} value={total > 0 ? formatRupiah(total) : "—"} strong />
      <LedgerRow label={`Uang muka ${Math.round(DOWN_PAYMENT_RATE * 100)}% (simulasi)`} value={total > 0 ? formatRupiah(total * DOWN_PAYMENT_RATE) : "—"} muted />
      {breakdown && (
        <button
          type="button"
          onClick={() => setBreakdownOpen(true)}
          className="flex min-h-12 items-center justify-between gap-3 rounded-[12px] bg-paper-deep px-3.5 text-left font-semibold hover:bg-line/60"
        >
          <span>Nelayan menerima</span>
          <span className="flex items-center gap-1">
            {formatRupiah(breakdown.fisherReceivesPerKg)}/kg
            <Icon name="chevronRight" size={20} className="text-ink-2" />
          </span>
        </button>
      )}
      {buyer.kind === "sppg" && <p className="text-[0.9375rem] leading-snug text-ink-2">Tanpa biaya layanan untuk dapur SPPG (Peraturan BGN 10/2026).</p>}
      {failure && <Notice tone="danger" title={failure} />}
    </div>
  );

  return (
    <>
      <RoleHeader title={buyer.name} subtitle={`${buyer.contactName} · pembeli`} currentRole="Pembeli" width="wide" />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-32 pt-4 sm:px-6 lg:pb-12">
        <ButtonLink href="/pembeli" variant="ghost" size="md" icon="chevronLeft" className="-ml-3 self-start">
          Pesanan
        </ButtonLink>
        {placed ? (
          <div className="max-w-2xl">
            <PlacedOrder order={placed} speciesName={db.species.find((species) => species.id === placed.speciesId)?.name ?? ""} onAnother={startAnother} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
            <div className="flex flex-col gap-7">
              <div className="flex flex-col gap-1">
                <h1 className="type-h1">Pesan untuk besok</h1>
                <p className="text-ink-2">
                  Ditutup {formatClock(cutoff)}
                  {minutesToCutoff > 0 ? ` · sisa ${formatDuration(minutesToCutoff)}` : ""}. KUB mengisi pesanan dari tangkapan besok pagi.
                </p>
              </div>
              <SpeciesPicker legend="Jenis ikan" species={db.species} value={speciesId} onChange={setSpeciesId} />
              <ChoiceGroup
                legend="Mutu paling rendah yang diterima"
                value={grade}
                onChange={setGrade}
                columns={2}
                options={(["A", "B"] as const).map((option) => ({
                  value: option,
                  title: `${option} · ${GRADE_LABEL[option]}`,
                  description: option === "A" ? "skor 8 ke atas" : "skor 7 ke atas",
                  visual: <GradeStamp grade={option} size="sm" />,
                }))}
              />
              <div className="flex flex-col gap-2.5">
                <TextField
                  label="Jumlah"
                  inputMode="numeric"
                  autoComplete="off"
                  suffix="kg"
                  placeholder="contoh: 40"
                  value={kgDigits ? formatNumber(kg) : ""}
                  onChange={(event) => setKgDigits(digitsOnly(event.target.value))}
                />
                <div className="flex flex-wrap gap-2">
                  {QUICK_KG.map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={kg === value}
                      onClick={() => setKgDigits(String(value))}
                      className="min-h-11 rounded-full border border-line-strong bg-surface px-4 font-semibold hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper"
                    >
                      {value} kg
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                <p className="type-h3">Dikirim {formatDayDate(`${deliveryDate}T12:00:00+07:00`)}, pukul</p>
                <Segmented
                  label="Jam kirim"
                  value={time}
                  onChange={setTime}
                  options={DELIVERY_TIMES.map((option) => ({ value: option, title: option.replace(":", ".") }))}
                />
              </div>
              <TextField label="Alamat dapur" value={address} onChange={(event) => setAddress(event.target.value)} />
              <div className="flex flex-col gap-2.5">
                <TextField
                  label="Harga per kg"
                  inputMode="numeric"
                  autoComplete="off"
                  suffix="Rp/kg"
                  placeholder={guide ? `contoh: ${formatNumber(guide.range.low)}` : "pilih ikan dan mutu dulu"}
                  value={priceDigits ? formatNumber(price) : ""}
                  onChange={(event) => setPriceDigits(digitsOnly(event.target.value))}
                />
                {guide && (
                  <>
                    <SourceNote simulated>
                      Harga wajar {formatPriceRange(guide.range.low, guide.range.high)}/kg. Dari PIPP KKP dan Panel Harga Bapanas,{" "}
                      {formatShortDate(`${guide.priceDate}T12:00:00+07:00`)}.
                    </SourceNote>
                    {guide.lastPricePaid !== null && guide.lastPricePaid !== price && (
                      <button
                        type="button"
                        onClick={() => setPriceDigits(String(guide.lastPricePaid))}
                        className="min-h-11 self-start rounded-full border border-line-strong bg-surface px-4 font-semibold hover:border-ink"
                      >
                        Pakai harga terakhir {formatRupiah(guide.lastPricePaid)}
                      </button>
                    )}
                    {price > 0 && price < guide.breakEvenPricePerKg && (
                      <Notice tone="warning" title="Nelayan menerima lebih rendah dari harga TPI">
                        Di bawah {formatRupiah(guide.breakEvenPricePerKg)}/kg, nelayan lebih untung menjual ke TPI. KUB mungkin tidak bisa mengisi
                        pesanan ini.
                      </Notice>
                    )}
                    {price >= guide.breakEvenPricePerKg && price < guide.range.low && (
                      <Notice tone="info" title="Di bawah harga wajar">
                        Masih di atas harga TPI untuk nelayan, tetapi di bawah kisaran wajar {formatPriceRange(guide.range.low, guide.range.high)}.
                      </Notice>
                    )}
                  </>
                )}
              </div>
            </div>

            <aside className="hidden lg:sticky lg:top-24 lg:block">
              <Card className="flex flex-col gap-4 p-6">
                <h2 className="type-h3">Ringkasan</h2>
                {summary}
                {hint && <p className="text-center font-semibold text-ink-2">{hint}</p>}
                <Button size="xl" block icon="send" busy={busy} disabled={hint !== null || busy} onClick={submit}>
                  Kirim pesanan
                </Button>
              </Card>
            </aside>
            <div className="lg:hidden">
              <Card className="flex flex-col gap-4 p-5">
                <h2 className="type-h3">Ringkasan</h2>
                {summary}
              </Card>
            </div>
          </div>
        )}
      </main>
      {!placed && (
        <div className="sticky bottom-0 z-20 border-t border-line bg-paper/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 px-4 sm:px-6">
            <p aria-live="polite" className="flex items-baseline justify-between gap-3 font-semibold">
              <span className="text-ink-2">{hint ?? "Total"}</span>
              {!hint && <span className="type-num-m">{formatRupiah(total)}</span>}
            </p>
            <Button size="xl" block icon="send" busy={busy} disabled={hint !== null || busy} onClick={submit}>
              Kirim pesanan
            </Button>
          </div>
        </div>
      )}
      {breakdown && (
        <Sheet open={breakdownOpen} onOpenChange={setBreakdownOpen} title="Rincian harga per kg" description="Ketuk baris untuk melihat rumusnya.">
          <PriceBreakdownList breakdown={breakdown} buyerKind={buyer.kind} portPricePerKg={guide?.portPricePerKg ?? 0} className="pb-2" />
        </Sheet>
      )}
    </>
  );
}
