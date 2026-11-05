# NELAYANKU

**Ikan nelayan kecil, mutu terukur, dibayar adil, tanpa ada yang terbuang.**

Sistem kerja digital untuk KUB/koperasi nelayan kecil. Di dermaga, operator memotret mata dan insang ikan, lalu AI di browser memberi skor kesegaran bergaya SNI 2729 (tetap jalan tanpa sinyal). Ikan yang bagus mengisi pesanan pembeli institusi yang sudah masuk sehari sebelumnya, ikan bermutu rendah dialihkan ke olahan ibu-ibu pesisir, dan setiap rupiah punya rincian yang jelas.

> **Status:** tahap perencanaan. Dokumen produk sudah siap ditinjau tim, dan pengembangan aplikasi dimulai 5 November 2026.

Proyek untuk **IT RUSH 2026 — Web Development** (HIMATIF Universitas Bengkulu), subtema **Ekonomi dan Pemberdayaan Masyarakat**.

---

## Masalah

- Di Kota Bani, Bengkulu Utara, **90% nelayan menjual ke toke** dan menerima harga apa adanya.
- Tongkol di TPI Pulau Baai dihargai **Rp13.000/kg**, padahal di pengecer **Rp30.000/kg**. Bagian nelayan hanya sekitar 43%.
- **77% nelayan Seluma berutang**, dan **85% nelayan Kota Bani tidak punya cool box**, sehingga ikan harus segera dijual berapa pun harganya.
- Mutu ikan hanya dinilai dengan mata, jadi pembeli institusi tidak punya bukti mutu dan asal ikan.

Sumber lengkap: [`docs/RISET.md`](docs/RISET.md).

## Solusi

1. **Grading AI di dermaga.** Foto mata dan insang dinilai model di browser, sedangkan bau dan tekstur diisi lewat dua ketukan. Hasilnya skor bergaya SNI 2729 beserta grade-nya.
2. **Pesanan dulu, baru tangkap.** Pembeli institusi (dapur SPPG, restoran, hotel, katering) memesan H-1. KUB lalu mengisi batch dari tangkapan anggota keesokan paginya.
3. **Harga transparan.** Rentang harga wajar dari data PIPP KKP dan Panel Harga Bapanas, plus rincian ke mana setiap rupiah pergi.
4. **Bagi hasil & buku kas.** Pembayaran dibagi otomatis per nelayan. Utang ke toke atau koperasi dicatat terbuka dan disetujui nelayan.
5. **Studio UMKM.** Ikan grade C jadi bahan olahan. Studio membantu menghitung HPP, menyusun label sesuai PerBPOM 31/2018, dan membuat caption jualan.
6. **QR lacak.** Setiap batch punya halaman bukti mutu publik.

## Dokumen

| Dokumen | Isi |
| :-- | :-- |
| [`docs/EVALUASI.md`](docs/EVALUASI.md) | Penilaian ide terhadap rubrik, UX dan keterbatasan nelayan, perkiraan skor |
| [`docs/MODEL_BISNIS.md`](docs/MODEL_BISNIS.md) | Siapa yang membayar, monetisasi, unit economics, go-to-market, rencana validasi |
| [`docs/PRD.md`](docs/PRD.md) | Spesifikasi produk: persona, alur, fitur, model data, AI, harga, rencana 16 hari |
| [`docs/RISET.md`](docs/RISET.md) | Fakta dan sumber (sudah dicek) |
| [`docs/PANDUAN_LOMBA.md`](docs/PANDUAN_LOMBA.md) | Aturan lomba, berkas wajib, struktur proposal |

## Rencana teknologi

Next.js (App Router) + TypeScript · Tailwind CSS · Supabase (Postgres, Auth, Storage, RLS) · onnxruntime-web (model kesegaran di browser) · Ultralytics YOLO11 (pelatihan model) · LLM API (Studio UMKM) · Vercel · GitHub Actions.

## Dataset & aset pihak ketiga (rencana)

| Aset | Lisensi | Dipakai untuk |
| :-- | :-- | :-- |
| [Freshness of the Fish Eyes (FFE), Mendeley Data](https://data.mendeley.com/datasets/xzyx7pbr3w) | CC BY 4.0 | Melatih model kesegaran mata ikan |
| [Fish Freshness Classification, Roboflow Universe](https://universe.roboflow.com/hanslab/fish-freshness-classification) | CC BY 4.0 | Melatih model kesegaran mata/insang |

Daftar library lengkap ditambahkan seiring pengembangan.

## Tim

| Nama | Peran |
| :-- | :-- |
| _(diisi tim)_ | Fullstack |
| _(diisi tim)_ | AI Engineer |
| _(diisi tim)_ | Produk & Validasi |
