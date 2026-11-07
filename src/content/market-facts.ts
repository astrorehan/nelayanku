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
  "Agribis UMB, Juli 2026: tongkol Rp13.000/kg di TPI Pulau Baai dan Rp30.000/kg di pengecer. Bagian nelayan sekitar 43% (hitungan penulis jurnal dari 12 pedagang).",
  "Simulasi rumus harga Nelayanku untuk dapur SPPG: harga pembeli − es dan angkut − kas KUB 8% − cadangan susut 3%. Angka final ditetapkan setelah wawancara pembeli.",
  "Peraturan BGN Nomor 10 Tahun 2026 tentang pelibatan pemasok lokal dan larangan komisi dalam pengadaan SPPG.",
  "Agribis Unived, Januari 2026: survei 62 nelayan di Seluma (Oktober 2025). 77,42% berutang dan 96,77% bergantung pada tengkulak atau pengepul.",
  "Mujagri, 2023: survei 20 nelayan di Kota Bani, Bengkulu Utara. 85% tidak punya cool box sehingga harus segera menjual ke pembeli terdekat.",
  "Mongabay, Maret 2022, dari data KemenPPPA 2016: 61% (sekitar 3,6 juta) pekerja pascapanen perikanan adalah perempuan.",
];

export interface ProblemFact {
  id: string;
  figure: string;
  label: string;
  detail: string;
  /** Nomor di LANDING_SOURCES, mulai dari 1. */
  sourceNo: number;
}

/** Angka masalah di landing. Hanya dari docs/RISET.md (bertanda V) dan docs/PRD.md bagian 2. */
export const PROBLEM_FACTS: readonly ProblemFact[] = [
  {
    id: "bagian-nelayan",
    figure: "43%",
    label: "bagian nelayan dari harga eceran tongkol",
    detail: "Tongkol Rp13.000/kg di TPI Pulau Baai, Rp30.000/kg di pengecer.",
    sourceNo: 1,
  },
  {
    id: "berutang",
    figure: "77,42%",
    label: "nelayan Seluma berutang",
    detail: "Dari 62 nelayan yang disurvei. 96,77% bergantung pada tengkulak atau pengepul.",
    sourceNo: 4,
  },
  {
    id: "tanpa-cool-box",
    figure: "85%",
    label: "nelayan Kota Bani tanpa cool box",
    detail: "Ikan harus segera dijual ke pembeli terdekat. Survei 20 nelayan.",
    sourceNo: 5,
  },
  {
    id: "perempuan",
    figure: "61%",
    label: "pekerja pascapanen perikanan adalah perempuan",
    detail: "Sekitar 3,6 juta orang. Data KemenPPPA 2016.",
    sourceNo: 6,
  },
];
