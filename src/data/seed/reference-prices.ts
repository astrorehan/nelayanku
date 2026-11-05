import { addDays, DEMO_DATE } from "../demo-clock";
import type { ReferencePrice, SpeciesId } from "../types";
import { createSeededRandom } from "./random";

export const REFERENCE_PRICE_DAYS = 31;

const PORT_SOURCE = { source: "PIPP KKP", location: "PPN Pulau Baai" };
const CONSUMER_SOURCE = { source: "Panel Harga Bapanas", location: "Kota Bengkulu" };

const BASE_PRICES: Record<SpeciesId, { port: number; consumer: number }> = {
  tongkol: { port: 13000, consumer: 30000 },
  cakalang: { port: 17000, consumer: 34000 },
  kembung: { port: 20000, consumer: 36000 },
};

function walk(seed: number, base: number, days: number, volatility: number): number[] {
  const random = createSeededRandom(seed);
  const prices: number[] = [];
  let price = base;
  for (let day = 0; day < days; day++) {
    price += (base - price) * 0.35 + random.between(-volatility, volatility);
    prices.push(Math.round(price / 50) * 50);
  }
  prices[days - 1] = base;
  return prices;
}

export function createReferencePrices(): ReferencePrice[] {
  const firstDate = addDays(DEMO_DATE, -(REFERENCE_PRICE_DAYS - 1));
  return (Object.keys(BASE_PRICES) as SpeciesId[]).flatMap((speciesId, index) => {
    const { port, consumer } = BASE_PRICES[speciesId];
    const portPrices = walk(101 + index, port, REFERENCE_PRICE_DAYS, port * 0.045);
    const consumerPrices = walk(201 + index, consumer, REFERENCE_PRICE_DAYS, consumer * 0.02);
    return portPrices.flatMap((portPrice, day): ReferencePrice[] => [
      { speciesId, kind: "port", date: addDays(firstDate, day), pricePerKg: portPrice, simulated: true, ...PORT_SOURCE },
      {
        speciesId,
        kind: "consumer",
        date: addDays(firstDate, day),
        pricePerKg: consumerPrices[day],
        simulated: true,
        ...CONSUMER_SOURCE,
      },
    ]);
  });
}
