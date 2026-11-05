"use client";

import { useState } from "react";
import { Icon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { ChoiceGroup } from "@/components/ui/choices";
import { TextField } from "@/components/ui/fields";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { Sheet } from "@/components/ui/overlays";
import { LedgerRow, Notice, SourceNote } from "@/components/ui/surface";
import { GRADE_LABEL, GRADE_SPOKEN } from "@/content/labels";
import type { FairPrice, RouteChoice } from "@/data/queries/destinations";
import { GRADES, type Grade, type SellableGrade } from "@/domain/grade";
import { GRADE_PRICE_MULTIPLIER } from "@/domain/pricing";
import { formatKg, formatNumber, formatPercent, formatPriceRange, formatRupiah, formatShortDate } from "@/lib/format";
import { ROUTE_ICON, routeAction, routeDetail } from "./route-copy";
import type { GradeOverride } from "./step-result";

const MAX_OFFER_DIGITS = 6;

function OfferVerdict({ offer, fair, orderPricePerKg }: { offer: number; fair: FairPrice; orderPricePerKg: number | null }) {
  const { low, high } = fair.range;
  const verdict =
    offer < low
      ? { tone: "warning" as const, title: "Di bawah harga wajar" }
      : offer > high
        ? { tone: "success" as const, title: "Di atas harga wajar" }
        : { tone: "info" as const, title: "Masuk harga wajar" };
  const difference = orderPricePerKg === null ? null : orderPricePerKg - offer;
  return (
    <Notice tone={verdict.tone} title={verdict.title}>
      {difference === null
        ? `Harga wajar ${formatPriceRange(low, high)} per kg.`
        : difference >= 0
          ? `Lewat pesanan, nelayan dapat ${formatRupiah(difference)}/kg lebih banyak dari tawaran toke.`
          : `Tawaran toke ${formatRupiah(-difference)}/kg lebih tinggi dari harga lewat pesanan.`}
    </Notice>
  );
}

export function FairPriceSheet({
  open,
  onOpenChange,
  fair,
  speciesName,
  grade,
  orderPricePerKg,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fair: FairPrice;
  speciesName: string;
  grade: SellableGrade;
  orderPricePerKg: number | null;
}) {
  const [offerDigits, setOfferDigits] = useState("");
  const offer = Number(offerDigits);
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Harga wajar"
      description={`Per kg, ${speciesName.toLowerCase()} ${GRADE_SPOKEN[grade]}, untuk nelayan`}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="type-num-xl">{formatPriceRange(fair.range.low, fair.range.high)}</p>
          <SourceNote simulated={fair.simulated}>
            {fair.source}, rata-rata 7 hari sampai {formatShortDate(`${fair.toDate}T12:00:00+07:00`)}
          </SourceNote>
        </div>
        <p className="leading-snug text-ink-2">
          {GRADE_SPOKEN[grade][0].toUpperCase() + GRADE_SPOKEN[grade].slice(1)} dihargai {formatPercent(GRADE_PRICE_MULTIPLIER[grade])} dari
          rata-rata TPI ({formatRupiah(fair.portPricePerKg)}), lalu diberi rentang −5% sampai +10%.
        </p>
        {orderPricePerKg !== null && <LedgerRow label="Lewat pesanan ini" value={`${formatRupiah(orderPricePerKg)}/kg`} strong />}
        <TextField
          label="Tawaran toke hari ini (boleh kosong)"
          inputMode="numeric"
          autoComplete="off"
          placeholder="contoh: 13.500"
          suffix="Rp/kg"
          value={offerDigits ? formatNumber(offer) : ""}
          onChange={(event) => setOfferDigits(event.target.value.replace(/\D/g, "").slice(0, MAX_OFFER_DIGITS))}
        />
        {offer > 0 && <OfferVerdict offer={offer} fair={fair} orderPricePerKg={orderPricePerKg} />}
      </div>
    </Sheet>
  );
}

const OVERRIDE_REASONS = ["Foto kurang jelas", "Ada memar", "Bau berubah", "Lainnya"] as const;
type OverrideReason = (typeof OVERRIDE_REASONS)[number];

export function OverrideSheet({
  open,
  onOpenChange,
  modelGrade,
  current,
  description,
  onSave,
  onClear,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelGrade: Grade;
  current: GradeOverride | null;
  description: string;
  onSave: (override: GradeOverride) => void;
  onClear: () => void;
}) {
  const knownReason = OVERRIDE_REASONS.find((reason) => reason === current?.reason) ?? null;
  const [grade, setGrade] = useState<Grade | null>(current?.grade ?? null);
  const [reason, setReason] = useState<OverrideReason | null>(current ? (knownReason ?? "Lainnya") : null);
  const [otherReason, setOtherReason] = useState(current && !knownReason ? current.reason : "");
  const reasonText = reason === "Lainnya" ? otherReason.trim() : (reason ?? "");
  const hint =
    grade === null
      ? "Pilih mutu dan alasan dulu"
      : grade === modelGrade
        ? "Pilih mutu yang berbeda dari hasil penilaian"
        : reason === null
          ? "Pilih alasan dulu"
          : reasonText === ""
            ? "Tulis alasannya dulu"
            : null;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Ubah mutu"
      description={description}
      footer={
        <div className="flex flex-col gap-2 pb-1">
          {hint && (
            <p aria-live="polite" className="text-center font-semibold text-ink-2">
              {hint}
            </p>
          )}
          <Button size="xl" block disabled={hint !== null} onClick={() => grade && onSave({ grade, reason: reasonText })}>
            Simpan mutu
          </Button>
          {current && (
            <Button variant="ghost" size="md" block onClick={onClear}>
              Kembalikan ke hasil penilaian ({GRADE_SPOKEN[modelGrade]})
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <ChoiceGroup
          legend="Mutu yang benar"
          value={grade}
          onChange={setGrade}
          columns={2}
          options={GRADES.map((option) => ({
            value: option,
            title: option === "REJECT" ? GRADE_LABEL[option] : `${option} · ${GRADE_LABEL[option]}`,
            description: option === modelGrade ? "hasil penilaian" : undefined,
            visual: <GradeStamp grade={option} size="sm" />,
          }))}
        />
        <ChoiceGroup
          legend="Alasan"
          value={reason}
          onChange={setReason}
          columns={2}
          options={OVERRIDE_REASONS.map((option) => ({ value: option, title: option }))}
        />
        {reason === "Lainnya" && (
          <TextField label="Tulis alasannya" value={otherReason} onChange={(event) => setOtherReason(event.target.value)} maxLength={80} />
        )}
        <p className="flex items-start gap-2 leading-snug text-ink-2">
          <Icon name="ledger" size={20} className="mt-0.5 shrink-0" />
          Perubahan mutu dicatat beserta alasan, nama operator, dan waktunya.
        </p>
      </div>
    </Sheet>
  );
}

export function OverTargetSheet({
  open,
  onOpenChange,
  choice,
  fisherName,
  weightKg,
  onSplit,
  onAllToAuction,
  busy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  choice: Extract<RouteChoice, { kind: "batch" }> | null;
  fisherName: string;
  weightKg: number;
  onSplit: () => void;
  onAllToAuction: () => void;
  busy: boolean;
}) {
  if (!choice) {
    return null;
  }
  const orderName = `${choice.view.species.name} ${choice.view.order.minimumGrade}`;
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={`Pesanan hanya butuh ${formatKg(choice.kg)} lagi`}
      description={`Ikan Pak ${fisherName} ${formatKg(weightKg)}. Sisanya ${formatKg(choice.leftoverKg)} dijual ke TPI hari ini.`}
      footer={
        <div className="flex flex-col gap-2 pb-1">
          <Button size="xl" block busy={busy} disabled={busy} onClick={onSplit}>
            Bagi: {formatKg(choice.kg)} ke pesanan, {formatKg(choice.leftoverKg)} ke TPI
          </Button>
          <Button variant="quiet" size="lg" block disabled={busy} onClick={onAllToAuction}>
            Semua ke TPI
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3 pb-2">
        <div aria-hidden className="flex h-11 gap-1 overflow-hidden rounded-[12px]">
          <span className="rounded-l-[12px] bg-ink" style={{ flexGrow: choice.kg }} />
          <span className="rounded-r-[12px] bg-[repeating-linear-gradient(-45deg,var(--color-paper-deep)_0_7px,var(--color-line)_7px_14px)]" style={{ flexGrow: choice.leftoverKg }} />
        </div>
        <LedgerRow label={<span className="font-semibold">Ke pesanan {orderName}</span>} value={formatKg(choice.kg)} strong />
        <LedgerRow label={<span className="font-semibold">Ke TPI</span>} value={formatKg(choice.leftoverKg)} strong />
      </div>
    </Sheet>
  );
}

export function OtherOptionsSheet({
  open,
  onOpenChange,
  description,
  alternatives,
  onChoose,
  onChangeGrade,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description: string;
  alternatives: RouteChoice[];
  onChoose: (choice: RouteChoice) => void;
  onChangeGrade: () => void;
}) {
  const rows = [
    ...alternatives.map((choice) => ({
      key: choice.kind === "batch" ? choice.view.batch.id : choice.kind,
      icon: ROUTE_ICON[choice.kind],
      title: routeAction(choice),
      detail: routeDetail(choice),
      onSelect: () => onChoose(choice),
    })),
    {
      key: "ubah-mutu",
      icon: "edit" as const,
      title: "Ubah mutu",
      detail: "Jika hasil penilaian tidak sesuai dengan ikannya",
      onSelect: onChangeGrade,
    },
  ];
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Pilihan lain" description={description}>
      <ul className="flex flex-col gap-2.5 pb-2">
        {rows.map((row) => (
          <li key={row.key}>
            <button
              type="button"
              onClick={row.onSelect}
              className="flex min-h-16 w-full items-center gap-3 rounded-[16px] border border-line-strong bg-surface px-4 py-3 text-left transition-[border-color,box-shadow,transform] duration-150 hover:border-ink hover:shadow-raised active:scale-[0.99]"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-paper-deep">
                <Icon name={row.icon} size={24} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-bold leading-snug">{row.title}</span>
                <span className="leading-snug text-ink-2">{row.detail}</span>
              </span>
              <Icon name="chevronRight" size={22} className="shrink-0 text-ink-2" />
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}

export function LeaveSheet({
  open,
  onOpenChange,
  fisherName,
  landingSummary,
  onLeave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fisherName: string;
  landingSummary: string | null;
  onLeave: () => void;
}) {
  const recorded = landingSummary !== null;
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={recorded ? "Keluar dulu?" : "Buang isian ini?"}
      description={
        recorded
          ? `Pendaratan Pak ${fisherName} ${landingSummary} sudah tercatat. Penilaiannya bisa dilanjutkan dari Beranda.`
          : `Isian untuk Pak ${fisherName} belum tercatat.`
      }
      footer={
        <div className="flex flex-col gap-2 pb-1">
          <Button size="xl" block onClick={() => onOpenChange(false)}>
            {recorded ? "Lanjut menilai" : "Lanjut mengisi"}
          </Button>
          <Button variant="quiet" size="lg" block onClick={onLeave}>
            {recorded ? "Ke Beranda" : "Buang dan keluar"}
          </Button>
        </div>
      }
    />
  );
}
