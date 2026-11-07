"use client";

import { RolePage } from "@/components/layout/role-shell";
import { PriceBoard } from "@/components/prices/price-board";
import { FisherTopBar } from "@/components/shells/role-shells";
import { useFisher } from "./fisher-shared";

export function FisherPrices() {
  const { fisher } = useFisher();
  return (
    <>
      <FisherTopBar title="Harga ikan" subtitle="Ikan Bapak layak dihargai berapa" />
      <RolePage>
        <PriceBoard audience="fisher" initialSpeciesId={fisher.usualSpeciesId} />
      </RolePage>
    </>
  );
}
