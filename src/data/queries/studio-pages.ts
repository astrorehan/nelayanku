import { computeCostOfGoods, suggestedRetailPrice, type CostOfGoods } from "@/domain/cost-of-goods";
import { checkLabelCompliance, type LabelCompliance } from "@/domain/label-compliance";
import { localDateOf } from "../demo-clock";
import type { DemoDatabase, Product } from "../types";
import { landingView } from "./landings";
import { processingMaterials } from "./studio";

export interface ProductSummary {
  product: Product;
  cost: CostOfGoods | null;
  /** Suggested selling price per pack, or null when the cost run is invalid. */
  price: number | null;
  /** Profit per pack at the suggested price. */
  marginPerPack: number | null;
  compliance: LabelCompliance;
  /** Unsatisfied required items plus forbidden claims. */
  missingCount: number;
  ready: boolean;
}

export function productSummary(product: Product): ProductSummary {
  let cost: CostOfGoods | null = null;
  try {
    const computed = computeCostOfGoods(product.run);
    cost = computed.packCount > 0 ? computed : null;
  } catch {
    cost = null;
  }
  const price = cost ? suggestedRetailPrice(cost.costPerPack, product.marginRate) : null;
  const compliance = checkLabelCompliance(product.label);
  const missingCount =
    compliance.checks.filter((check) => !check.satisfied).length + compliance.forbiddenClaims.length;
  return {
    product,
    cost,
    price,
    marginPerPack: cost && price !== null ? price - cost.costPerPack : null,
    compliance,
    missingCount,
    ready: compliance.readyToPrint && Boolean(cost),
  };
}

export function producerProducts(db: DemoDatabase, producerId: string): ProductSummary[] {
  return db.products.filter((product) => product.producerId === producerId).map(productSummary);
}

export function findProducerProduct(db: DemoDatabase, producerId: string, productId: string) {
  const product = db.products.find((item) => item.id === productId && item.producerId === producerId);
  return product ? productSummary(product) : null;
}

export interface MaterialCard {
  materialId: string;
  landingId: string;
  speciesId: string;
  speciesName: string;
  kg: number;
  pricePerKg: number;
  landedAt: string;
  iced: boolean;
  hoursSinceLanding: number;
  takenByMe: boolean;
}

export function availableMaterialCards(db: DemoDatabase, producerId: string, now: Date): MaterialCard[] {
  return processingMaterials(db, producerId, undefined, localDateOf(now)).map(({ material, view }) => ({
    materialId: material.id,
    landingId: material.landingId,
    speciesId: view.species.id,
    speciesName: view.species.name,
    kg: material.kg,
    pricePerKg: material.pricePerKg,
    landedAt: view.landing.landedAt,
    iced: view.landing.iced,
    hoursSinceLanding: Math.max(
      0,
      Math.round(((now.getTime() - new Date(view.landing.landedAt).getTime()) / 3_600_000) * 10) / 10,
    ),
    takenByMe: material.takenByProducerId === producerId,
  }));
}

export interface StudioStats {
  productCount: number;
  rescuedKg: number;
  readyCount: number;
  notReadyCount: number;
}

export function studioStats(summaries: readonly ProductSummary[]): StudioStats {
  const ready = summaries.filter((item) => item.ready).length;
  return {
    productCount: summaries.length,
    rescuedKg:
      Math.round(
        summaries
          .filter((item) => item.product.materialId)
          .reduce((sum, item) => sum + item.product.run.rawFishKg, 0) * 10,
      ) / 10,
    readyCount: ready,
    notReadyCount: summaries.length - ready,
  };
}

export interface CostSegment {
  key: "fish" | "seasoning" | "fuel" | "labor" | "packaging";
  label: string;
  amount: number;
  share: number;
}

export function costBreakdown(product: Product): CostSegment[] {
  const cost = productSummary(product).cost;
  if (!cost || cost.totalCost <= 0) {
    return [];
  }
  const parts: Array<Omit<CostSegment, "share">> = [
    { key: "fish", label: "Ikan", amount: cost.rawFishCost },
    { key: "seasoning", label: "Bumbu", amount: product.run.seasoningCost },
    { key: "fuel", label: "Bahan bakar", amount: product.run.fuelCost },
    { key: "labor", label: "Tenaga", amount: product.run.laborCost },
    { key: "packaging", label: "Kemasan", amount: cost.packagingCost },
  ];
  return parts.map((part) => ({ ...part, share: part.amount / cost.totalCost }));
}

export function productOrigin(db: DemoDatabase, product: Product) {
  if (!product.materialId) {
    return null;
  }
  const material = db.materials.find((item) => item.id === product.materialId);
  const view = material ? landingView(db, material.landingId) : undefined;
  return material && view ? { material, view } : null;
}

export interface PermitStep {
  id: "nib" | "spp-irt" | "halal";
  title: string;
  issuer: string;
  purpose: string;
  documents: string[];
  /** Rough duration. Always an estimate, never a promise. */
  estimate: string;
  url: string;
  linkLabel: string;
}

export const PERMIT_STEPS: readonly PermitStep[] = [
  {
    id: "nib",
    title: "NIB, identitas usaha",
    issuer: "Pemerintah pusat lewat OSS (oss.go.id)",
    purpose: "Nomor Induk Berusaha. Dasar untuk mengurus izin lain.",
    documents: ["KTP pemilik usaha", "NPWP, jika sudah punya", "Alamat dan jenis kegiatan usaha", "Nomor HP dan email aktif"],
    estimate: "Perkiraan: di hari yang sama sampai beberapa hari",
    url: "https://oss.go.id/",
    linkLabel: "Buka OSS",
  },
  {
    id: "spp-irt",
    title: "SPP-IRT, izin pangan rumahan",
    issuer: "Dinas Kesehatan kabupaten/kota, lewat sppirt.pom.go.id",
    purpose: "Menghasilkan nomor P-IRT yang ditulis di label. Jenis pangan harus termasuk yang boleh.",
    documents: [
      "NIB",
      "KTP",
      "Daftar bahan dan proses produksi",
      "Contoh rancangan label",
      "Sertifikat penyuluhan keamanan pangan",
    ],
    estimate: "Perkiraan: beberapa minggu, termasuk penyuluhan dan pemeriksaan sarana",
    url: "https://sppirt.pom.go.id/",
    linkLabel: "Buka SPP-IRT",
  },
  {
    id: "halal",
    title: "Sertifikat halal",
    issuer: "BPJPH, Kementerian Agama",
    purpose: "Dibutuhkan sebelum label atau teks jualan boleh menyebut halal.",
    documents: [
      "NIB",
      "Daftar bahan dan pemasok",
      "Alur proses produksi",
      "Pendamping proses produk halal, jika memakai jalur swadaya",
    ],
    estimate: "Perkiraan: beberapa minggu, tergantung jalur dan antrean pemeriksaan",
    url: "https://bpjph.halal.go.id/",
    linkLabel: "Buka BPJPH",
  },
];
