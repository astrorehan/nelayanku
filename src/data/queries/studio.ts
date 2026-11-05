import type { DemoDatabase, Product } from "../types";
import { DEMO_DATE, localDateOf } from "../demo-clock";
import { landingView } from "./landings";

export function processingMaterials(
  db: DemoDatabase,
  producerId: string,
  productId?: string,
  date = DEMO_DATE,
  selectedMaterialId?: string | null,
) {
  return db.materials
    .flatMap((material) => {
      const view = landingView(db, material.landingId);
      const currentMaterialId = selectedMaterialId ?? db.products.find((product) => product.id === productId)?.materialId;
      const used = db.products.some(
        (product) =>
          product.materialId === material.id && product.id !== productId,
      );
      if (
        !view?.grading ||
        view.grading.grade !== "C" ||
        material.kg <= 0 ||
        (material.id !== currentMaterialId && (localDateOf(view.landing.landedAt) !== date || Boolean(material.takenByProducerId))) ||
        used ||
        (material.takenByProducerId &&
          material.takenByProducerId !== producerId)
      )
        return [];
      return [{ material, view }];
    })
    .sort((a, b) =>
      b.view.landing.landedAt.localeCompare(a.view.landing.landedAt),
    );
}

export function newProduct(
  db: DemoDatabase,
  producerId: string,
  now: Date,
  id: string,
): Product {
  const producer = db.producers.find(
    (candidate) => candidate.id === producerId,
  )!;
  return {
    id,
    producerId,
    materialId: null,
    name: "",
    brand: "",
    spokenDescription: "",
    run: {
      rawFishKg: 0,
      rawFishPricePerKg: 0,
      yieldRatio: 0.45,
      packNetWeightGrams: 250,
      seasoningCost: 0,
      fuelCost: 0,
      laborCost: 0,
      packagingCostPerPack: 0,
    },
    marginRate: 0.3,
    label: {
      productName: "",
      ingredients: [],
      netWeightGrams: 250,
      producerName: producer.name,
      producerAddress: producer.address,
      productionCode: "",
      productionDate: localDateOf(now),
      bestBefore: "",
      pirtNumber: "",
      halalCertificateNumber: "",
      marketingText: "",
    },
    captions: { whatsappStatus: "", marketplace: "", instagram: "" },
  };
}
