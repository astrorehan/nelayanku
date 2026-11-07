"use client";

import { RolePage } from "@/components/layout/role-shell";
import { RoleHandoff } from "@/components/layout/role-handoff";
import { FisherTopBar } from "@/components/shells/role-shells";
import { ButtonLink } from "@/components/ui/button";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { Card, LedgerRow, Notice, Pill, SourceNote } from "@/components/ui/surface";
import { useDemoHydrated, useDemoNow } from "@/data/demo-data-provider";
import { payoutExplanation } from "@/data/queries/fisher-pages";
import { batchView } from "@/data/queries/batches";
import type { BreakdownLineKey } from "@/domain/pricing";
import {
  formatKg,
  formatPercent,
  formatPriceRange,
  formatRupiah,
  formatShortDayDate,
  formatSignedRupiah,
} from "@/lib/format";
import { NotFoundCard, approvalLabel, useFisher } from "./fisher-shared";

const BACK = { href: "/nelayan/uang", label: "Kembali ke uang masuk" };

const LINE_LABEL: Record<BreakdownLineKey, string> = {
  buyer_price: "Dibayar pembeli",
  ice_and_transport: "Es dan angkut",
  kub_fund: "Kas KUB",
  platform_fee: "Biaya layanan",
  shrinkage_reserve: "Cadangan susut",
};

function PriceBar({ label, value, max, strong }: { label: string; value: number; max: number; strong?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className={strong ? "font-semibold" : "text-ink-2"}>{label}</span>
        <span className="tabular font-semibold">{formatRupiah(value)}/kg</span>
      </div>
      <div className="h-3.5 overflow-hidden rounded-full bg-sky-tint" aria-hidden>
        <div
          className={strong ? "h-full rounded-full bg-sea" : "h-full rounded-full bg-line-strong"}
          style={{
            width: `${max > 0 ? Math.min(100, (value / max) * 100) : 0}%`,
          }}
        />
      </div>
    </div>
  );
}

export function FisherPayoutDetail({ batchId }: { batchId: string }) {
  const { db, fisher } = useFisher();
  const now = useDemoNow();
  const hydrated = useDemoHydrated();
  const explanation = payoutExplanation(db, fisher.id, batchId, now);

  if (!explanation) {
    const rejected = hydrated ? batchView(db, batchId, now) : null;
    if (rejected?.receipt?.decision === "reject" && rejected.contributions.some((item) => item.fisher.id === fisher.id)) {
      return (
        <>
          <FisherTopBar title="Kiriman ditolak" subtitle={rejected.batch.code} back={BACK} />
          <RolePage>
            <Notice tone="warning" title="Tidak ada uang masuk dari kiriman ini">
              Pembeli menolak seluruh {formatKg(rejected.filledKg)}. Tidak ada pembayaran atau cicilan yang dipotong dari kiriman ini.
            </Notice>
            <Card className="flex flex-col gap-3 p-5">
              <h2 className="type-h3">Alasan pembeli</h2>
              <p className="text-ink-2">{rejected.receipt.reason ?? "Alasan belum dicatat."}</p>
              {rejected.receipt.note && <p className="text-ink-2">{rejected.receipt.note}</p>}
              <SourceNote simulated>Catatan penolakan bukan hasil uji laboratorium. Operator perlu memeriksa ikan sebelum menentukan penanganannya.</SourceNote>
              <RoleHandoff href={`/lacak/${rejected.batch.code}`} icon="qr">Lihat jejak kiriman {rejected.batch.code}</RoleHandoff>
            </Card>
          </RolePage>
        </>
      );
    }
    if (!hydrated) {
      return (
        <>
          <FisherTopBar title="Memuat" back={BACK} />
          <RolePage>
            <p className="text-ink-2">Memuat catatan…</p>
          </RolePage>
        </>
      );
    }
    return (
      <>
        <FisherTopBar title="Uang tidak ditemukan" back={BACK} />
        <RolePage>
          <NotFoundCard title="Catatan uang ini tidak ada" back={BACK} />
        </RolePage>
      </>
    );
  }

  const {
    payout,
    view,
    pricePerKg,
    portPricePerKg,
    portDate,
    gainRate,
    extraVersusPort,
    fairRange,
    breakdown,
    deductions,
  } = explanation;
  const species = view.species.name.toLowerCase();
  const better = extraVersusPort >= 0;
  const barMax = Math.max(pricePerKg, portPricePerKg);

  return (
    <>
      <FisherTopBar
        title="Kenapa harganya segini"
        subtitle={`${formatKg(payout.kg)} ${species} · ${formatShortDayDate(payout.date)}`}
        back={BACK}
      />
      <RolePage>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          <div className="flex flex-col gap-6">
            <Card emphasis className="flex flex-col gap-1 p-5">
              <p className="text-ink-2">Uang yang Bapak terima</p>
              <p className="type-figure-hero">{formatRupiah(payout.net)}</p>
              <p className="flex flex-wrap items-center gap-2 text-ink-2">
                {view.batchGrade && <GradeStamp grade={view.batchGrade} size="sm" />}
                Kiriman {view.batch.code} ke {view.buyer.name}
              </p>
            </Card>

            <section aria-labelledby="hitungan" className="flex flex-col gap-2">
              <h2 id="hitungan" className="type-h3">
                Dari kotor ke bersih
              </h2>
              <Card className="flex flex-col gap-3 p-5">
                <p className="tabular text-ink-2">
                  {formatKg(payout.kg)} × {formatRupiah(pricePerKg)}/kg
                </p>
                <LedgerRow label="Uang kotor" value={formatRupiah(payout.gross)} strong />
                {deductions.length === 0 && <LedgerRow label="Cicilan" value={formatRupiah(0)} muted />}
                {deductions.map((entry) => {
                  const state = approvalLabel(entry);
                  const applied = state.tone === "success";
                  return (
                    <div key={entry.id} className="flex flex-col gap-1">
                      <LedgerRow
                        label={`Cicilan ${entry.counterparty}`}
                        value={applied ? `− ${formatRupiah(entry.amount)}` : formatRupiah(0)}
                        muted={!applied}
                      />
                      <Pill tone={state.tone} className="self-start">
                        {state.label}
                      </Pill>
                    </div>
                  );
                })}
                <div className="border-t-2 border-ink pt-3">
                  <LedgerRow label="Uang bersih masuk" value={formatRupiah(payout.net)} strong />
                </div>
                <p className="text-[0.9375rem] leading-snug text-ink-2">
                  Cicilan hanya dipotong kalau Bapak setuju. Tanpa persetujuan, uang masuk utuh.
                </p>
              </Card>
            </section>
          </div>

          <div className="flex flex-col gap-6">
            <section aria-labelledby="per-kg" className="flex flex-col gap-2">
              <h2 id="per-kg" className="type-h3">
                Harga per kg dari pembeli
              </h2>
              <Card className="flex flex-col gap-3 p-5">
                {breakdown.lines.map((line) => (
                  <LedgerRow
                    key={line.key}
                    label={line.rate ? `${LINE_LABEL[line.key]} (${formatPercent(line.rate)})` : LINE_LABEL[line.key]}
                    value={
                      line.key === "buyer_price" || line.amountPerKg === 0
                        ? formatRupiah(line.amountPerKg)
                        : `− ${formatRupiah(line.amountPerKg)}`
                    }
                    strong={line.key === "buyer_price"}
                    muted={line.key !== "buyer_price"}
                  />
                ))}
                <div className="border-t-2 border-ink pt-3">
                  <LedgerRow
                    label="Diterima nelayan per kg"
                    value={formatRupiah(breakdown.fisherReceivesPerKg)}
                    strong
                  />
                </div>
              </Card>
            </section>

            <section aria-labelledby="banding" className="flex flex-col gap-2">
              <h2 id="banding" className="type-h3">
                Dibanding jual di TPI
              </h2>
              <Card className="flex flex-col gap-4 p-5">
                <PriceBar label="Lewat KUB" value={pricePerKg} max={barMax} strong />
                <PriceBar label={`Harga TPI ${formatShortDayDate(portDate)}`} value={portPricePerKg} max={barMax} />
                {better ? (
                  <Notice tone="success" title={`Lebih besar ${formatRupiah(extraVersusPort)} dari harga TPI`}>
                    {formatSignedRupiah(pricePerKg - portPricePerKg)} per kg, atau {formatPercent(gainRate)} di atas
                    TPI, untuk {formatKg(payout.kg)} ini.
                  </Notice>
                ) : (
                  <Notice
                    tone="warning"
                    title={`Lebih kecil ${formatRupiah(Math.abs(extraVersusPort))} dari harga TPI`}
                  >
                    Kiriman ini dibayar {formatPercent(Math.abs(gainRate))} di bawah harga TPI hari itu.
                  </Notice>
                )}
                {fairRange && (
                  <p className="leading-snug text-ink-2">
                    Kisaran harga adil untuk mutu {view.batchGrade}: {formatPriceRange(fairRange.low, fairRange.high)}{" "}
                    per kg.
                  </p>
                )}
                <SourceNote simulated>
                  Harga TPI di demo ini adalah data contoh, bukan harga lelang yang sebenarnya.
                </SourceNote>
              </Card>
            </section>

            <ButtonLink
              href={`/lacak/${view.batch.code}`}
              variant="secondary"
              size="md"
              icon="qr"
              className="self-start"
            >
              Lihat jejak kiriman {view.batch.code}
            </ButtonLink>
          </div>
        </div>
      </RolePage>
    </>
  );
}
