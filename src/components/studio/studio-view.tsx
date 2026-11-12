"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { RolePage } from "@/components/layout/role-shell";
import { ProducerTopBar } from "@/components/shells/role-shells";
import { Button, ButtonLink } from "@/components/ui/button";
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

function storedDraft(): Product | null {
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
    return null;
  }
  return null;
}

const BACK = { href: "/umkm", label: "Kembali ke beranda studio" };

function StudioWorkspace({ savedId }: { savedId: string | null }) {
  const db = useDemoDatabase();
  const now = useDemoNow();
  const repository = useRepository();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const savedProducts = db.products.filter(
    (item) => item.producerId === DEMO_PRODUCER_ID,
  );
  // A saved product (?produk=) opens with its unsaved draft when there is one.
  // Without it, an unsaved draft is resumed, otherwise a blank product starts.
  const [opening] = useState(() => {
    const draft = storedDraft();
    const saved = savedProducts.find((item) => item.id === savedId);
    if (saved) return { product: draft?.id === saved.id ? draft : saved, resumed: false };
    if (draft && !savedProducts.some((item) => item.id === draft.id))
      return { product: draft, resumed: Boolean(draft.name.trim() || draft.materialId) };
    return {
      product: newProduct(db, DEMO_PRODUCER_ID, now, `produk-${crypto.randomUUID()}`),
      resumed: false,
    };
  });
  const [product, setProduct] = useState(opening.product);
  const stepParam = Number(searchParams.get("langkah"));
  const step =
    Number.isInteger(stepParam) && stepParam >= 1 && stepParam <= 5
      ? stepParam - 1
      : 0;
  const goTo = (nextStep: number, productId?: string | null) => {
    const params = new URLSearchParams();
    const id = productId === undefined ? searchParams.get("produk") : productId;
    if (id) params.set("produk", id);
    if (nextStep > 0) params.set("langkah", String(nextStep + 1));
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };
  const savedHere = savedProducts.some((item) => item.id === product.id);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState("");
  const materials = processingMaterials(
    db,
    DEMO_PRODUCER_ID,
    product.id,
    localDateOf(now),
    product.materialId,
  );
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
      goTo(step, product.id);
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
      goTo(Math.min(4, step + 1));
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
      <ProducerTopBar
        back={BACK}
        title="Studio olahan"
        subtitle={product.name.trim() || "Produk baru"}
      />
      <RolePage>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="type-eyebrow">Dari tangkapan ke produk</p>
            <SimulatedTag />
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
              setChecked(false);
              goTo(0, null);
            }}
          >
            Produk baru
          </Button>
        </div>
        {opening.resumed && !savedHere && (
          <Notice tone="info" title="Draf terakhir dilanjutkan">
            Pilih Produk baru jika ingin mulai dari kosong.
          </Notice>
        )}
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
                  onClick={() => goTo(index)}
                >
                  {index + 1}. {label}
                </button>
              </li>
            ))}
          </ol>
        </nav>
        {failure && <Notice tone="danger" title={failure} />}
        {message && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <p role="status" className="text-success-ink">
              {message}
            </p>
            <Link
              href={`/umkm/produk/${encodeURIComponent(product.id)}`}
              className="inline-flex min-h-12 items-center font-semibold text-sea-deep underline underline-offset-4"
            >
              Lihat halaman produk
            </Link>
          </div>
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
                  onClick={() => goTo(step - 1)}
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
      </RolePage>
    </>
  );
}

export function StudioView() {
  const hydrated = useDemoHydrated();
  const db = useDemoDatabase();
  const savedId = useSearchParams().get("produk");
  if (!hydrated) {
    return (
      <>
        <ProducerTopBar back={BACK} title="Studio olahan" />
        <RolePage>
          <p className="text-ink-2">Membuka draf produk di perangkat ini…</p>
        </RolePage>
      </>
    );
  }
  if (
    savedId &&
    !db.products.some(
      (item) => item.id === savedId && item.producerId === DEMO_PRODUCER_ID,
    )
  ) {
    return (
      <>
        <ProducerTopBar back={BACK} title="Produk tidak ditemukan" />
        <RolePage>
          <Notice tone="warning" title="Produk ini tidak ada di perangkat ini">
            Tautannya mungkin salah, atau produk belum pernah disimpan di sini.
          </Notice>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/umkm/produk" variant="quiet" icon="jar">
              Lihat semua produk
            </ButtonLink>
            <ButtonLink href="/umkm/studio" icon="plus">
              Produk baru
            </ButtonLink>
          </div>
        </RolePage>
      </>
    );
  }
  return <StudioWorkspace savedId={savedId} />;
}
