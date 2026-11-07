/**
 * Peta situs: satu-satunya daftar halaman yang ditampilkan di kaki halaman
 * dan di halaman 404. Hanya rute yang ada. Rute baru (misalnya /tentang dan
 * /faq) cukup ditambahkan ke kelompok yang sesuai di sini.
 * Rute detail memakai contoh dari data benih supaya tautannya selalu terbuka.
 */
export type SiteLink = { href: string; label: string };
export type SiteGroup = { id: string; title: string; links: readonly SiteLink[] };

export const SITE_MAP: readonly SiteGroup[] = [
  {
    id: "publik",
    title: "Publik",
    links: [
      { href: "/", label: "Halaman depan" },
      { href: "/juri", label: "Panduan juri" },
      { href: "/coba", label: "Coba nilai ikan" },
      { href: "/tentang/model", label: "Cara AI menilai" },
      { href: "/lacak", label: "Lacak kiriman" },
      { href: "/masuk", label: "Masuk" },
    ],
  },
  {
    id: "operator",
    title: "Operator",
    links: [
      { href: "/kub", label: "Beranda KUB" },
      { href: "/kub/darat", label: "Catat pendaratan" },
      { href: "/kub/pesanan", label: "Pesanan dan batch" },
      { href: "/kub/harga", label: "Harga hari ini" },
      { href: "/kub/anggota", label: "Anggota" },
      { href: "/kub/bayar", label: "Bayar dan buku kas" },
      { href: "/kub/dampak", label: "Dampak" },
    ],
  },
  {
    id: "nelayan",
    title: "Nelayan",
    links: [
      { href: "/nelayan", label: "Hari ini" },
      { href: "/nelayan/tangkapan", label: "Tangkapan" },
      { href: "/nelayan/uang", label: "Uang masuk" },
      { href: "/nelayan/pinjaman", label: "Pinjaman" },
      { href: "/nelayan/harga", label: "Harga ikan" },
    ],
  },
  {
    id: "pembeli",
    title: "Pembeli",
    links: [
      { href: "/pembeli", label: "Ringkasan" },
      { href: "/pembeli/pesan", label: "Pesan untuk besok" },
      { href: "/pembeli/pesanan", label: "Pesanan" },
      { href: "/pembeli/harga", label: "Harga ikan" },
    ],
  },
  {
    id: "umkm",
    title: "UMKM",
    links: [
      { href: "/umkm", label: "Beranda studio" },
      { href: "/umkm/bahan", label: "Bahan baku" },
      { href: "/umkm/produk", label: "Produk" },
      { href: "/umkm/studio", label: "Studio produk baru" },
      { href: "/umkm/izin", label: "Jalur izin" },
    ],
  },
  {
    id: "dokumen",
    title: "Dokumen",
    links: [
      { href: "/pembeli/dokumen", label: "Dokumen dan faktur" },
      { href: "/lacak/CKL-B-0511", label: "Bukti mutu kiriman (contoh)" },
      { href: "/lacak/bahan/bahan-darat-2026-10-29-darman", label: "Asal bahan olahan (contoh)" },
    ],
  },
];
