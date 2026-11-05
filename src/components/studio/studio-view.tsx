"use client";

import { useState } from "react";
import { RoleHeader } from "@/components/layout/role-header";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/choices";
import { Card, Notice, SimulatedTag } from "@/components/ui/surface";
import {
  useDemoDatabase,
  useDemoHydrated,
  useDemoNow,
  useRepository,
} from "@/data/demo-data-provider";
import { localDateOf } from "@/data/demo-clock";
import { DEMO_PRODUCER_ID } from "@/data/demo-identities";
import { newProduct, processingMaterials } from "@/data/queries/studio";
import type { Product } from "@/data/types";
import { checkLabelCompliance } from "@/domain/label-compliance";
import { printDocument } from "@/lib/print-document";
import { CaptionStep } from "./caption-step";
import { CostStep, productionProblem } from "./cost-step";
import { LabelStep } from "./label-step";
import { MaterialStep } from "./material-step";
import { ProductLabel, productLabelDocument } from "./product-label";
import { ProductStep } from "./product-step";

export const STUDIO_DRAFT_KEY = "nelayanku.studio.draft";
const STEPS = ["Bahan", "Produk", "Modal", "Label", "Teks jualan"];

function restoredDraft(fallback: Product) {
  try {
    const draft = JSON.parse(localStorage.getItem(STUDIO_DRAFT_KEY) ?? "null");
    if (
      draft?.producerId === DEMO_PRODUCER_ID &&
      draft.run &&
      draft.label &&
      draft.captions &&
      typeof draft.id === "string"
    )
      return draft as Product;
  } catch {
    return fallback;
  }
  return fallback;
}

function StudioWorkspace() {
  const db = useDemoDatabase();
  const now = useDemoNow();
  const repository = useRepository();
  const savedProducts = db.products.filter(
    (item) => item.producerId === DEMO_PRODUCER_ID,
  );
  const [product, setProduct] = useState(() =>
    restoredDraft(
      savedProducts[0] ??
        newProduct(db, DEMO_PRODUCER_ID, now, `produk-${crypto.randomUUID()}`),
    ),
  );
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState("");
  const materials = processingMaterials(db, DEMO_PRODUCER_ID, product.id, localDateOf(now), product.materialId);
  const selected = materials.find(
    ({ material }) => material.id === product.materialId,
  );
  const compliance = checkLabelCompliance(product.label);
  const costProblem = productionProblem(product);
  const materialReady =
    selected?.material.takenByProducerId === DEMO_PRODUCER_ID &&
    product.run.rawFishKg <= selected.material.kg;
  const canPrint = compliance.readyToPrint && !costProblem && materialReady;
  const stepProblem =
    step === 0
      ? !selected
        ? "Pilih bahan yang tersedia dulu"
        : !checked
          ? "Periksa bahan, lalu centang pernyataannya"
          : null
      : step === 1
        ? !product.name.trim()
          ? "Isi nama produk dulu"
          : !product.label.ingredients.some((ingredient) => ingredient.trim())
            ? "Isi komposisi produk dulu"
            : !(product.run.packNetWeightGrams > 0)
              ? "Isi berat bersih per kemasan"
              : null
        : step === 2
          ? !materialReady
            ? "Berat bahan tidak boleh melebihi bahan yang sudah diambil"
            : costProblem
          : null;

  const change = (next: Product) => {
    setProduct(next);
    setMessage("");
    try {
      localStorage.setItem(STUDIO_DRAFT_KEY, JSON.stringify(next));
      setFailure("");
    } catch {
      setFailure(
        "Ruang simpan perangkat tidak tersedia atau penuh. Draf tetap terbuka, tetapi belum aman setelah halaman ditutup.",
      );
    }
  };

  const save = async () => {
    if (!product.name.trim()) {
      setFailure("Isi nama produk sebelum menyimpan");
      return;
    }
    setBusy(true);
    try {
      await repository.saveProduct(product);
      setMessage("Produk tersimpan di perangkat ini");
      setFailure("");
    } catch {
      setFailure(
        "Produk belum tersimpan. Periksa bahan dan isian produk, lalu coba lagi.",
      );
    } finally {
      setBusy(false);
    }
  };

  const next = async () => {
    if (stepProblem) return;
    setBusy(true);
    try {
      if (step === 0 && selected && !selected.material.takenByProducerId)
        await repository.takeMaterial({
          materialId: selected.material.id,
          producerId: DEMO_PRODUCER_ID,
        });
      setStep(Math.min(4, step + 1));
      setFailure("");
      document.getElementById("studio-step")?.focus();
    } catch {
      setFailure("Bahan ini sudah tidak tersedia. Pilih bahan lain.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <RoleHeader
        title="Studio olahan"
        subtitle="Bu Yanti · KUB Sumber Jaya"
        currentRole="Pengolah UMKM"
        width="wide"
      />
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <p className="type-eyebrow">Dari tangkapan ke produk</p>
              <SimulatedTag />
            </div>
            <h1 className="type-h1">Studio UMKM</h1>
          </div>
          <Button
            variant="quiet"
            size="md"
            icon="plus"
            onClick={() => {
              change(
                newProduct(
                  db,
                  DEMO_PRODUCER_ID,
                  now,
                  `produk-${crypto.randomUUID()}`,
                ),
              );
              setStep(0);
              setChecked(false);
            }}
          >
            Produk baru
          </Button>
        </header>
        <div className="flex flex-col gap-2">
          <label htmlFor="saved-product" className="font-medium">
            Buka produk tersimpan
          </label>
          <select
            id="saved-product"
            className="min-h-12 w-full rounded-[10px] border border-line-strong bg-surface px-3 sm:max-w-md"
            value={
              savedProducts.some((item) => item.id === product.id)
                ? product.id
                : ""
            }
            onChange={(event) => {
              const saved = savedProducts.find(
                (item) => item.id === event.target.value,
              );
              if (saved) {
                change(saved);
                setStep(0);
                setChecked(false);
              }
            }}
          >
            <option value="" disabled>
              Produk baru, belum disimpan
            </option>
            {savedProducts.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <nav
          aria-label="Langkah Studio"
          className="flex flex-col gap-3 border-y border-line py-4"
        >
          <Stepper step={step + 1} total={5} label="Kemajuan produk" />
          <ol className="grid grid-cols-5 gap-2">
            {STEPS.map((label, index) => (
              <li key={label}>
                <button
                  className={`min-h-12 w-full rounded-[8px] px-1 text-left text-sm sm:text-base ${index === step ? "font-semibold text-ink" : "text-ink-2"}`}
                  aria-current={index === step ? "step" : undefined}
                  onClick={() => setStep(index)}
                >
                  {index + 1}. {label}
                </button>
              </li>
            ))}
          </ol>
        </nav>
        {failure && <Notice tone="danger" title={failure} />}
        {message && (
          <p role="status" className="text-success-ink">
            {message}
          </p>
        )}
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.85fr)]">
          <section
            id="studio-step"
            tabIndex={-1}
            aria-label={`Langkah ${step + 1}: ${STEPS[step]}`}
            className="flex min-w-0 flex-col gap-6 outline-none"
          >
            {step === 0 && (
              <MaterialStep
                materials={materials}
                selectedId={product.materialId}
                checked={checked}
                onChecked={setChecked}
                onSelect={(id) => {
                  const item = materials.find(
                    ({ material }) => material.id === id,
                  )!;
                  change({
                    ...product,
                    materialId: id,
                    run: {
                      ...product.run,
                      rawFishKg: item.material.kg,
                      rawFishPricePerKg: item.material.pricePerKg,
                    },
                  });
                  setChecked(false);
                }}
              />
            )}
            {step === 1 && <ProductStep product={product} onChange={change} />}
            {step === 2 && <CostStep product={product} onChange={change} />}
            {step === 3 && <LabelStep product={product} onChange={change} />}
            {step === 4 && (
              <CaptionStep
                product={product}
                origin={
                  product.materialId ? `${db.kub.name}, ${db.kub.port}` : null
                }
                onChange={change}
              />
            )}
            <div className="flex flex-col gap-3 border-t border-line pt-5">
              {stepProblem && <p className="text-ink-2">{stepProblem}</p>}
              {step < 4 ? (
                <Button
                  size="xl"
                  block
                  busy={busy}
                  disabled={Boolean(stepProblem) || busy}
                  iconAfter="arrowRight"
                  onClick={() => void next()}
                >
                  {step === 0
                    ? "Ambil bahan dan lanjut"
                    : `Lanjut ke ${STEPS[step + 1].toLowerCase()}`}
                </Button>
              ) : (
                <Button
                  size="xl"
                  icon="check"
                  block
                  busy={busy}
                  disabled={busy || !product.name.trim()}
                  onClick={() => void save()}
                >
                  Simpan produk
                </Button>
              )}
              {step > 0 && (
                <Button
                  variant="ghost"
                  icon="arrowLeft"
                  onClick={() => setStep(step - 1)}
                >
                  Kembali ke {STEPS[step - 1].toLowerCase()}
                </Button>
              )}
              {step < 4 && (
                <Button
                  variant="ghost"
                  icon="savedOnDevice"
                  disabled={busy || !product.name.trim()}
                  onClick={() => void save()}
                >
                  Simpan draf produk
                </Button>
              )}
            </div>
          </section>
          <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-24">
            <h2 className="type-h3">Pratinjau label</h2>
            <ProductLabel product={product} />
            {!canPrint && (
              <p className="text-sm text-ink-2">
                {!product.materialId
                  ? "Pilih asal bahan sebelum cetak"
                  : costProblem
                    ? "Periksa perhitungan modal sebelum cetak"
                    : "Lengkapi isi wajib dan periksa klaim pada langkah Label sebelum cetak"}
              </p>
            )}
            <Button
              variant="quiet"
              icon="printer"
              disabled={!canPrint}
              onClick={async () => {
                try {
                  await printDocument(
                    `Label ${product.name}`,
                    productLabelDocument(product, window.location.origin),
                  );
                } catch {
                  setFailure("Label belum bisa dibuka. Coba lagi.");
                }
              }}
            >
              Cetak label / simpan PDF
            </Button>
            <Card tone="paper" className="p-4 text-sm text-ink-2">
              Draf tersimpan saat isian berubah. Semua bahan, uang, dan nomor
              izin pada contoh adalah simulasi.
            </Card>
          </aside>
        </div>
      </main>
    </>
  );
}

export function StudioView() {
  const hydrated = useDemoHydrated();
  return hydrated ? (
    <StudioWorkspace />
  ) : (
    <main className="mx-auto max-w-6xl p-6" aria-busy="true">
      <h1 className="type-h1">Studio UMKM</h1>
      <p className="mt-4 text-ink-2">Membuka draf produk di perangkat ini…</p>
    </main>
  );
}
