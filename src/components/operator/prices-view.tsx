"use client";

import { RolePage } from "@/components/layout/role-shell";
import { OperatorTopBar } from "@/components/operator/operator-shell";
import { PriceBoard } from "@/components/prices/price-board";
import { Card, SourceNote } from "@/components/ui/surface";
import { useDemoDatabase } from "@/data/demo-data-provider";
import {
  FAIR_RANGE_LOWER_FACTOR,
  FAIR_RANGE_UPPER_FACTOR,
  GRADE_PRICE_MULTIPLIER,
  KUB_FUND_RATE,
} from "@/domain/pricing";
import { formatPercent } from "@/lib/format";

export function PricesView() {
  const db = useDemoDatabase();
  const lower = Math.round((1 - FAIR_RANGE_LOWER_FACTOR) * 100);
  const upper = Math.round((FAIR_RANGE_UPPER_FACTOR - 1) * 100);
  return (
    <>
      <OperatorTopBar title="Harga hari ini" subtitle={<span className="lg:hidden">{db.kub.name}</span>} />
      <RolePage>
        <PriceBoard audience="kub" />
        <Card tone="paper" className="flex flex-col gap-3 p-5">
          <h2 className="type-h3">Bagaimana harga wajar dihitung</h2>
          <ol className="flex list-decimal flex-col gap-1.5 pl-5 leading-snug text-ink-2">
            <li>Mulai dari rata-rata harga TPI 7 hari terakhir.</li>
            <li>
              Kalikan dengan faktor mutu: A {GRADE_PRICE_MULTIPLIER.A}, B {GRADE_PRICE_MULTIPLIER.B}, C {GRADE_PRICE_MULTIPLIER.C}.
            </li>
            <li>
              Beri rentang dari {lower}% di bawah sampai {upper}% di atas, dibulatkan ke Rp100.
            </li>
            <li>Dana KUB {formatPercent(KUB_FUND_RATE)} dipotong dari harga pesanan, bukan dari harga ikan di TPI.</li>
          </ol>
          <SourceNote simulated>
            Rentang ini pegangan saat menawar dengan toke, bukan harga yang dipatok. Harga acuan di demo ini data contoh.
          </SourceNote>
        </Card>
      </RolePage>
    </>
  );
}
