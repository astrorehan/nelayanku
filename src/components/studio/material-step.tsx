import { CheckChoice } from "@/components/ui/choices";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { Card, Notice } from "@/components/ui/surface";
import type { processingMaterials } from "@/data/queries/studio";
import {
  formatClock,
  formatKg,
  formatRupiah,
  formatShortDate,
} from "@/lib/format";

type MaterialView = ReturnType<typeof processingMaterials>[number];

export function MaterialStep({
  materials,
  selectedId,
  onSelect,
  checked,
  onChecked,
}: {
  materials: MaterialView[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  checked: boolean;
  onChecked: (checked: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="type-h2">Pilih bahan dari dermaga</h2>
        <p className="mt-2 text-ink-2">
          Hanya ikan mutu C yang belum dipakai produk lain. Ikan tolak tidak
          masuk daftar ini.
        </p>
      </div>
      {materials.length ? (
        <fieldset className="flex flex-col gap-3">
          <legend className="sr-only">Bahan olahan tersedia</legend>
          {materials.map(({ material, view }) => (
            <label
              key={material.id}
              className={`flex min-h-24 cursor-pointer items-start gap-3 rounded-[18px] border p-4 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-sea ${selectedId === material.id ? "border-sea bg-sky-tint ring-1 ring-sea" : "border-line bg-surface hover:border-line-strong"}`}
            >
              <input
                className="mt-2 size-5 shrink-0 accent-[var(--color-sea)]"
                type="radio"
                name="bahan"
                value={material.id}
                checked={selectedId === material.id}
                onChange={() => onSelect(material.id)}
              />
              <GradeStamp grade="C" size="sm" />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-lg font-medium">
                  {view.species.name} · {formatKg(material.kg)}
                </span>
                <span className="text-ink-2">
                  Darat {formatShortDate(view.landing.landedAt)},{" "}
                  {formatClock(view.landing.landedAt)} WIB ·{" "}
                  {view.landing.iced ? "pakai es" : "tanpa es"}
                </span>
                <span className="tabular">
                  {formatRupiah(material.pricePerKg)}/kg · total{" "}
                  {formatRupiah(material.kg * material.pricePerKg)}
                </span>
                {material.takenByProducerId && (
                  <span className="text-sm text-ink-2">
                    Sudah diambil untuk draf Anda
                  </span>
                )}
              </span>
            </label>
          ))}
        </fieldset>
      ) : (
        <Card className="p-5">
          Belum ada bahan tersedia. Operator perlu mengarahkan ikan mutu C ke
          olahan terlebih dahulu.
        </Card>
      )}
      <Notice tone="warning" title="Periksa kembali sebelum diolah">
        Skor mutu bukan uji keamanan. Bau busuk dan ikan yang tidak layak tidak
        boleh diolah. Tanggal dan jam darat ditampilkan supaya bahan lama tidak
        terlewat.
      </Notice>
      <CheckChoice
        checked={checked}
        onChange={onChecked}
        title="Saya sudah memeriksa bahan"
        description="Ikan masih layak diolah dan kondisi penyimpanannya sudah diperiksa"
      />
    </div>
  );
}
