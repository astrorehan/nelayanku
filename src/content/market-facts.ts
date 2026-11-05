export interface CitedFact {
  value: number;
  source: string;
  detail: string;
}

export const PORT_AUCTION_TONGKOL_PRICE: CitedFact = {
  value: 13000,
  source: "Agribis UMB, Juli 2026",
  detail: "Harga tongkol di TPI Pulau Baai",
};

export const RETAIL_TONGKOL_PRICE: CitedFact = {
  value: 30000,
  source: "Agribis UMB, Juli 2026",
  detail: "Harga tongkol di pengecer Kota Bengkulu",
};

export const EXAMPLE_SPPG_BUYER_PRICE = 20000;

export const LANDING_SOURCES = [
  "Agribis UMB, Juli 2026: tongkol Rp13.000/kg di TPI Pulau Baai dan Rp30.000/kg di pengecer.",
  "Simulasi rumus harga NELAYANKU untuk dapur SPPG: harga pembeli − es dan angkut − kas KUB 8% − cadangan susut 3%. Angka final ditetapkan setelah wawancara pembeli.",
  "Peraturan BGN Nomor 10 Tahun 2026 tentang pelibatan pemasok lokal dan larangan komisi dalam pengadaan SPPG.",
];
