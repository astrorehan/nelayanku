import { TextField } from "@/components/ui/fields";
import { Card, LedgerRow } from "@/components/ui/surface";
import type { Product } from "@/data/types";
import {
  computeCostOfGoods,
  suggestedRetailPrice,
} from "@/domain/cost-of-goods";
import { formatDecimal, formatNumber, formatRupiah } from "@/lib/format";

export function productionProblem(product: Product): string | null {
  try {
    const cost = computeCostOfGoods(product.run);
    if (cost.packCount < 1)
      return "Hasil olahan belum cukup untuk satu kemasan. Periksa berat dan hasil olahan.";
    if (
      !Number.isFinite(product.marginRate) ||
      product.marginRate < 0 ||
      product.marginRate > 2
    )
      return "Isi tambahan harga antara 0 dan 200%";
    return null;
  } catch {
    return "Periksa biaya, berat, dan persentase hasil olahan. Semua harus berupa angka yang valid.";
  }
}

export function CostStep({
  product,
  onChange,
}: {
  product: Product;
  onChange: (product: Product) => void;
}) {
  const run = product.run;
  const problem = productionProblem(product);
  const cost = problem ? null : computeCostOfGoods(run);
  const fields = [
    { key: "rawFishKg", label: "Ikan yang diolah", suffix: "kg", step: 0.1 },
    {
      key: "rawFishPricePerKg",
      label: "Harga bahan per kg",
      suffix: "Rp",
      step: 50,
    },
    { key: "seasoningCost", label: "Garam dan bumbu", suffix: "Rp", step: 500 },
    { key: "fuelCost", label: "Gas / bahan bakar", suffix: "Rp", step: 500 },
    { key: "laborCost", label: "Upah pengerjaan", suffix: "Rp", step: 500 },
    {
      key: "packagingCostPerPack",
      label: "Kemasan per bungkus",
      suffix: "Rp",
      step: 100,
    },
  ] as const;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="type-h2">Hitung modal dan harga jual</h2>
        <p className="mt-2 text-ink-2">
          Biaya untuk satu kali produksi. Harga bahan berasal dari catatan
          dermaga dan bisa dikoreksi sesuai kenyataan.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(({ key, label, suffix, step }) => (
          <TextField
            key={key}
            label={label}
            suffix={suffix}
            type="number"
            inputMode="decimal"
            min={0}
            step={step}
            value={run[key]}
            onChange={(event) =>
              onChange({
                ...product,
                run: { ...run, [key]: Number(event.target.value) },
              })
            }
          />
        ))}
        <TextField
          label="Hasil olahan dari bahan awal"
          hint="45% berarti 10 kg bahan menjadi 4,5 kg olahan. Sesuaikan dengan hasil produksi Anda."
          suffix="%"
          type="number"
          min={1}
          max={100}
          value={Number((run.yieldRatio * 100).toFixed(2))}
          onChange={(event) =>
            onChange({
              ...product,
              run: { ...run, yieldRatio: Number(event.target.value) / 100 },
            })
          }
        />
        <TextField
          label="Tambahan harga di atas modal"
          suffix="%"
          type="number"
          min={0}
          max={200}
          value={Math.round(product.marginRate * 100)}
          onChange={(event) =>
            onChange({
              ...product,
              marginRate: Number(event.target.value) / 100,
            })
          }
        />
      </div>
      {cost ? (
        <Card tone="paper" className="flex flex-col gap-3 p-5">
          <LedgerRow
            label="Hasil jadi"
            value={`${formatDecimal(cost.finishedGrams / 1000)} kg`}
          />
          <LedgerRow
            label="Kemasan utuh"
            value={`${formatNumber(cost.packCount)} × ${run.packNetWeightGrams} g`}
          />
          <LedgerRow label="Total modal" value={formatRupiah(cost.totalCost)} />
          <div className="border-t border-line pt-4">
            <p className="text-ink-2">Modal per kemasan</p>
            <p className="type-money mt-2 text-[2rem]">
              {formatRupiah(cost.costPerPack)}
            </p>
          </div>
          <div className="border-t border-line pt-4">
            <p className="text-ink-2">Saran harga jual per kemasan</p>
            <p className="type-money mt-2 text-[2rem]">
              {formatRupiah(
                suggestedRetailPrice(cost.costPerPack, product.marginRate),
              )}
            </p>
            <p className="mt-3 text-sm text-ink-2">
              Modal + tambahan {Math.round(product.marginRate * 100)}%,
              dibulatkan ke atas per Rp500. Ini markup atas modal, bukan
              persentase laba dari harga jual.
            </p>
          </div>
        </Card>
      ) : (
        <p role="status" className="text-danger-ink">
          {problem}
        </p>
      )}
    </div>
  );
}
