# NELAYANKU

**Ikan nelayan kecil, mutu terukur, dibayar adil, tanpa ada yang terbuang.**

Sistem kerja digital untuk KUB/koperasi nelayan kecil. Di dermaga, operator memotret mata dan insang ikan, lalu AI di browser memberi skor kesegaran bergaya SNI 2729 (tetap jalan tanpa sinyal). Ikan yang bagus mengisi pesanan pembeli institusi yang sudah masuk sehari sebelumnya, ikan bermutu rendah dialihkan ke olahan ibu-ibu pesisir, dan setiap rupiah punya rincian yang jelas.

> **Status:** frontend demo berjalan di cabang `feat/frontend-ui`. Semua peran memakai data simulasi yang tersimpan di browser. Model terlatih, backend, dan layanan AI teks belum dihubungkan.

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

## Menjalankan frontend

Node.js 24 dan pnpm 10.28.0 (versi pnpm tercatat di `package.json`).

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

Buka `http://localhost:3000`. Melalui `/masuk`, pilih salah satu dari empat peran. Akun email demo memakai kata sandi `nelayanku-demo`. Ini pemilih peran demo, bukan autentikasi produksi.

```sh
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
corepack pnpm start
```

Build juga menyiapkan service worker beserta halaman, foto contoh, dan font lokal. Uji offline pada **production build** setelah halaman dibuka dengan sinyal dan service worker selesai aktif. Mode `dev` tidak memasang service worker.

```sh
corepack pnpm exec playwright install --with-deps chromium
corepack pnpm test:e2e
```

Playwright membuka production build di port 3100, pada laptop 1366 px dan HP 360 px. Build terlebih dahulu sebelum menjalankan tes. Jika memakai Chromium sistem, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` ke lokasi binarinya. GitHub Actions menjalankan lint, TypeScript, unit test, build, dan alur browser.

## Cakupan demo

| Area | Yang dapat dicoba |
| :-- | :-- |
| Publik | Halaman depan, enam foto penilaian, masuk peran, lacak kode/QR, dokumen mutu PDF/JSON, batas model |
| Operator | Catat pendaratan, nilai mata/insang/bau/tekstur, ubah grade dengan alasan, isi batch, label QR, checklist kirim, buku kas, dampak |
| Nelayan | Persetujuan cicilan, pendapatan, pinjaman, riwayat CSV dan cetak/PDF |
| Pembeli | Pesan H-1, harga transparan, terima/terima sebagian/tolak dengan foto bukti, dokumen mutu, faktur simulasi |
| UMKM | Ambil bahan C, suara/teks/foto produk, kalkulator modal, validator label, cetak/PDF dengan QR asal bahan, tiga teks jualan yang dapat disunting |
| Perangkat | Simpan data dan draf, reload tanpa sinyal setelah cache siap, peringatan ruang simpan penuh, reset demo |

Panduan verifikasi dan batas integrasi: [`docs/frontend/STATUS.md`](docs/frontend/STATUS.md). Audit desain dan atribusi metode: [`docs/frontend/DESIGN.md`](docs/frontend/DESIGN.md).

## Batas integrasi

- Hasil mata dari enam contoh **disimulasikan** berdasarkan kelas dataset. Tidak ada inferensi ONNX; foto unggahan dinilai manual. Akurasi belum diukur.
- Label dan teks jualan disusun dari isian dengan template deterministik. Tidak ada panggilan LLM, nomor izin tidak dibuat otomatis.
- Database demo berada di `localStorage`, bukan Supabase. Tidak ada sinkronisasi server, RLS, akun produksi, atau pembayaran nyata. Tautan kiriman baru hanya menampilkan perubahan pada browser yang mencatatnya; perangkat lain hanya punya seed demo.
- Service worker menyimpan aset dan halaman demo, bukan antrean sinkron backend. Halaman dinamis perlu dibuka sekali dengan sinyal sebelum bisa dimuat ulang offline.
- Suara memakai Web Speech API bila tersedia; dapat membutuhkan internet. Bila ditolak atau tidak didukung, gunakan teks. Kamera selalu memiliki cadangan unggah/manual.
- Cetak/PDF membuka dialog cetak browser. Nomor izin contoh dan semua dokumen yang dihasilkan bertanda simulasi; validator format bukan verifikasi izin.

## Library dan aset

Next.js / React / TypeScript, Tailwind CSS, Radix Dialog/Popover, Motion, clsx, uqr, Vitest, Playwright. Versi lengkap ada di `package.json` dan lockfile. Logo dan ilustrasi ikan berada di repositori ini. Huruf Atkinson Hyperlegible Next, Atkinson Hyperlegible Mono, dan Mona Sans disimpan lokal dari Fontsource 5.3.0, lisensi OFL 1.1 disertakan di `src/app/fonts/`.

Audit visual mengikuti [unslop oleh Damir Sokolovsky (@heydamir)](https://github.com/heydamir/unslop), CC BY 4.0. Hero memakai satu ilustrasi peti tongkol; provenance dan prompt tercatat di [`docs/frontend/ASSETS.md`](docs/frontend/ASSETS.md).

## Dataset dan foto contoh

| Aset | Lisensi | Dipakai untuk |
| :-- | :-- | :-- |
| [Freshness of the Fish Eyes (FFE), Mendeley Data](https://data.mendeley.com/datasets/xzyx7pbr3w) | CC BY 4.0 | Melatih model kesegaran mata ikan |
| [Fish Freshness Classification, Roboflow Universe](https://universe.roboflow.com/hanslab/fish-freshness-classification) | CC BY 4.0 | Melatih model kesegaran mata/insang |

Enam foto mata kembung dari FFE dipotong persegi dan disimpan ulang sebagai JPEG. Atribusi, nama file asli, DOI, dan perubahan tercatat di `src/ai/sample-photos.ts` serta halaman `/tentang/model`. Dataset Roboflow masih rencana, belum dipakai model demo.

## Tim

| Nama | Peran |
| :-- | :-- |
| _(diisi tim)_ | Fullstack |
| _(diisi tim)_ | AI Engineer |
| _(diisi tim)_ | Produk & Validasi |
