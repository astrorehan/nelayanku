import type { DemoDatabase, ReferencePrice, ReferencePriceKind, SpeciesId } from "../types";

export const PORT_PRICE_AVERAGE_DAYS = 7;

export function priceSeries(db: DemoDatabase, speciesId: SpeciesId, kind: ReferencePriceKind): ReferencePrice[] {
  return db.referencePrices
    .filter((price) => price.speciesId === speciesId && price.kind === kind)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function latestReferencePrice(
  db: DemoDatabase,
  speciesId: SpeciesId,
  kind: ReferencePriceKind,
  onOrBefore: string,
): ReferencePrice {
  const series = priceSeries(db, speciesId, kind).filter((price) => price.date <= onOrBefore);
  const latest = series[series.length - 1];
  if (!latest) {
    throw new Error(`No ${kind} price for ${speciesId} on or before ${onOrBefore}`);
  }
  return latest;
}

export function averagePortPrice(db: DemoDatabase, speciesId: SpeciesId, onOrBefore: string): {
  pricePerKg: number;
  fromDate: string;
  toDate: string;
  source: string;
} {
  const window = priceSeries(db, speciesId, "port")
    .filter((price) => price.date <= onOrBefore)
    .slice(-PORT_PRICE_AVERAGE_DAYS);
  if (window.length === 0) {
    throw new Error(`No port prices for ${speciesId} on or before ${onOrBefore}`);
  }
  const average = window.reduce((sum, price) => sum + price.pricePerKg, 0) / window.length;
  return {
    pricePerKg: Math.round(average / 50) * 50,
    fromDate: window[0].date,
    toDate: window[window.length - 1].date,
    source: window[0].source,
  };
}

export function movingAverage(values: readonly number[], size: number): Array<number | null> {
  return values.map((_, index) => {
    if (index < size - 1) {
      return null;
    }
    const slice = values.slice(index - size + 1, index + 1);
    return slice.reduce((sum, value) => sum + value, 0) / size;
  });
}
