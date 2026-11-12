# Status frontend

Gelombang 3, 8 November 2026 WIB, di cabang `feat/frontend-ui` setelah `346c71b`. Gelombang 2 dan 3 selesai. Catatan gelombang 2 tetap di bawah.

# Teks jualan AI di Studio (8 November 2026)

- **Route** `POST /api/studio/teks` (`src/app/api/studio/teks/route.ts`, runtime Node). Masukan divalidasi `parseSalesCopyInput` (`src/domain/sales-copy.ts`), lalu `writeSalesCopy` (`src/server/sales-copy-model.ts`) memanggil `claude-haiku-5-5` dengan effort `low`, `max_tokens` 2.000, dan keluaran JSON berskema tiga kanal. Fakta produk dikirim sebagai JSON di tag `<produk>`; catatan pemilik diperlakukan sebagai data.
- **Pemeriksaan hasil** (`checkGeneratedCopy`): ditolak bila ada klaim terlarang dari validator label, menyebut P-IRT/BPOM/halal/SNI, umur simpan, "tanpa pengawet/MSG", organik, promo/diskon/ongkir, angka rupiah selain harga, kanal kosong, atau melebihi batas panjang (300/1.000/700 karakter). Teks yang ditolak tidak pernah sampai ke browser.
- **Jawaban route**: 503 tanpa `ANTHROPIC_API_KEY`, 400 masukan rusak, 429 batas (10 per jam per IP, 300 per hari per instance, dalam memori), 422 jawaban tidak lolos, 502 galat hulu.
- **Studio**: tombol utama "Susun dengan AI"; "Susun ulang dari isian" tetap template. Setiap kegagalan (tanpa sinyal, 503, 429, 422, galat) mengisi teks dari template dan menampilkan alasannya tepat di bawah tombol. Tur dan e2e lama tetap memakai tombol template.
- Teks di `/tentang`, FAQ, dan README diperbarui: teks jualan kini memakai model bahasa, label dan nomor izin tetap tidak.

## Verifikasi

- Lint, typecheck: lulus. Unit test **226 pada 31 berkas** lulus (tambah tes validator, rate limit, pemanggil model dengan klien tiruan, dan route).
- Build lulus; e2e **24 lulus**. Alur Studio e2e kini juga menguji cadangan 503 dan jalur AI dengan respons tiruan.
- Tangkapan langkah teks jualan diperiksa di 360 dan 1366 px.
- **Belum diuji dengan API sungguhan**: tidak ada kunci di mesin ini. Coba sekali setelah kunci dipasang, dan sesuaikan prompt bila hasilnya sering ditolak pemeriksa (Studio tetap aman karena jatuh ke template).

## Untuk pemilik

- Pasang `ANTHROPIC_API_KEY` di `.env.local` dan Environment Variables Vercel, lalu **set spend limit workspace di Anthropic Console** (misalnya US$1). Batas di route hanya per instance dan tidak menggantikan batas belanja.
- Anthropic TypeScript SDK ditambahkan ke daftar library README. Claude Haiku perlu dicantumkan juga di tabel AI pada surat orisinalitas dan proposal (aturan V.5).

# Gelombang 3: halaman publik

## Rute dan komponen baru

- **Kerangka publik bersama.** `src/app/(publik)/layout.tsx` memasang `PublicHeader` dan `PublicFooter` untuk `/`, `/coba`, `/masuk`, `/lacak/**`, `/tentang/**`, `/juri`, `/tentang`, dan `/faq`. URL tidak berubah. Tombol header kini ditentukan dari alamat (`/` sesudah hero, `/coba` dan `/lacak*` tanpa tombol, lainnya selalu); prop `ctaMode` tetap bisa menimpa. Daftar sumber landing pindah dari footer ke bagian akhir `main` landing dengan id `sumber-N` yang sama.
- **Peta situs.** `src/content/site-map.ts` (data) dan `src/components/layout/site-map.tsx` (tampilan) dipakai footer dan `not-found.tsx`. Kelompok: Publik, Operator, Nelayan, Pembeli, UMKM, Dokumen. Ubah juga berkas ini bila menu peran berubah. Label "Cara AI menilai" dipakai e2e.
- **Landing.** Baris "Masalah dalam angka" (43% bagian nelayan dari harga eceran, 77,42% nelayan Seluma berutang, 85% nelayan Kota Bani tanpa cool box, 61% pekerja pascapanen perempuan) dengan nomor sumber, data di `PROBLEM_FACTS` (`src/content/market-facts.ts`) dari `docs/RISET.md` baris bertanda V. Bagian "Lihat isi aplikasi" dengan empat tab peran yang merender komponen asli (`OrderCard`, `LandingRow`, `ActiveOrderCard`, `ProductCard`, `MaterialCard`) dari data demo, plus tautan "Buka sebagai …". Pita penutup: Ikuti tur juri, Coba nilai ikan, Lacak contoh kiriman. Hero tidak diubah.
- **`/lacak`.** Empat contoh kiriman yang labelnya dihitung dari data (`traceExamples`): CKL-B-0511 di jalan, TGK-A-0411 diterima, TGK-A-1410 diterima sebagian, TGK-A-0311-R ditolak. Satu kartu asal bahan olahan (`materialExample`) dan baris privasi.
- **`/lacak/[kode]`.** Timeline mendarat, dinilai, penuh, berangkat, diterima/ditolak (vertikal di HP, mendatar di desktop), cincin jam sejak darat (`FreshClock`, berhenti saat diterima, ditandai aturan simulasi), hasil penerimaan (hanya keputusan dan kg; alasan, catatan, skor cek ulang tidak dibuka), `ParameterBars`, dan bar porsi per "Nelayan #" yang bisa dibuka. Teks "Nelayan #", cap SHA-256, cetak, dan unduh tetap. `/lacak/bahan/[id]` ikut dirapikan.
- **`/tentang/model`.** Penggeser empat parameter memakai `freshness-score.ts`, bar ambang A/B/C/Tolak, diagram "4 dari 6 parameter" SNI 2729, galeri enam foto FFE dengan label kelas, dan kotak "Rencana evaluasi" dengan confusion matrix kosong berlabel "Rencana, bukan data". Tidak ada angka akurasi. "Model terlatih belum dipasang" tetap.
- **`/tentang`** (masalah, solusi, tim dari README, sumber data, batas demo) dan **`/faq`** (enam pertanyaan dengan `details`/`summary`). Keduanya masuk menu header, peta situs, dan `e2e/reliability.spec.ts`.
- **`/masuk`.** Kartu peran menampilkan persona, dua angka hidup dari data demo (`roleCardStats`, `src/data/queries/role-cards.ts`, dibaca setelah hydrate), dan petunjuk "Mulai dari …".
- Ada **40 pola rute halaman** (38 + `/tentang` + `/faq`).

## Hasil verifikasi gelombang 3

- `corepack pnpm lint`, `corepack pnpm typecheck`: lulus.
- `corepack pnpm test`: **209 tes pada 27 berkas lulus** (sebelumnya 198 pada 26).
- `corepack pnpm build`: lulus; **15 halaman offline dan 81 aset** disiapkan.
- `corepack pnpm test:e2e`: **24 tes lulus**, 12 desktop dan 12 HP, termasuk tur juri sembilan langkah.
- Sweep `lampiran/sweep-rute.mjs` dengan rute tambahan (`/juri`, `/tentang`, `/faq`, tiga contoh lacak baru, asal bahan, dan alamat 404): **40 alamat pada 360 dan 1366 px, 80 tampilan, bersih** (tanpa galat, overflow, atau NO LINK).
- Tangkapan layar landing, lacak, model, masuk, tentang, dan faq diperiksa di kedua lebar. Setiap unit juga diperiksa ulang oleh peninjau terpisah; temuan yang diperbaiki antara lain kartu pesanan terpotong di tab Operator 360 px, judul angka masalah yang menyisakan satu kata, cincin jam yang sempit di HP, dan label angka KUB di `/masuk` yang ambigu.
- CI remote belum dilihat; hasil belum di-push.

## Catatan untuk pemilik (gelombang 3)

- Pemindai QR kamera di `/lacak` tidak dibuat (opsional di tugas). Teks "pakai kamera HP" tetap, dan kode bisa diketik.
- `/tentang` dan `/faq` tidak dimasukkan ke daftar precache `scripts/build-offline.mjs`; keduanya tersimpan offline setelah sekali dibuka online, dan FAQ menyatakan hal itu.
- Biaya di jawaban "siapa yang membayar" (2%, Rp0 untuk SPPG, sekitar Rp99.000/bulan untuk Pro) ditulis sebagai asumsi rencana dari `docs/MODEL_BISNIS.md`, belum diuji ke pembeli. Klaim bahwa Peraturan BGN 10/2026 melarang komisi berasal dari sumber sekunder [S]; mohon dicek ke teks peraturannya.
- Tile "Bagian nelayan Rp16.300" di hero dan angka 43% di "Masalah dalam angka" adalah konsep berbeda dengan label mirip. Hero tidak diubah sesuai tugas; pertimbangkan merapikan kalimatnya.
- Di 360 px, hasil penggeser di `/tentang/model` berada di bawah empat penggeser, jadi skor tidak terlihat saat menggeser (tetap diumumkan pembaca layar). Di desktop, `/lacak/[kode]` menyisakan sedikit ruang kosong di bawah panel parameter.
- Angka masalah adalah survei lokal Bengkulu, bukan angka nasional; `/tentang` menyebutkan ini.

# Gelombang 2

## Rute dan komponen baru

- `/juri`: panduan sembilan langkah, hasil yang diharapkan, referensi fitur PRD, reset berkonfirmasi, dan batas demo. Dapat dibuka dari landing, header publik, halaman masuk, dan menu Demo.
- Ada **38 pola rute halaman** (`src/app/**/page.tsx`), yaitu 37 pola yang sudah ada ditambah `/juri`. Angka 34 pada handoff lama bukan jumlah berkas halaman aktual; ikon, manifest, dan halaman galat tidak dihitung.
- `src/components/tour/`: konfigurasi langkah, penyimpanan lokal yang aman, halaman panduan, serta penanda tur yang dipasang sekali di root layout. Default mati. Memuat ulang melanjutkan langkah; penyimpanan yang ditolak tetap dapat memakai status dalam memori selama halaman terbuka.
- Penanda mengambang di atas navigasi bawah. Pada `/coba`, pendaratan, batch, formulir pesanan, penerimaan, dan Studio, bar mengambil ruang di atas header sehingga tidak menutupi kontrol tugas. Sheet langkah berisi petunjuk tindakan dan tautan ke setiap langkah.
- `RoleHandoff`: tautan sekunder di pendaratan tersimpan, rincian pendaratan, batch berangkat, penerimaan pembeli, dan bagi hasil. Tautan persona hanya menuju Darman, SPPG Kampung Melayu, atau Studio Bu Yanti yang tersedia. Tautan lacak pada tangkapan/uang nelayan dan asal bahan UMKM dipertahankan.
- Halaman uang nelayan untuk kiriman ditolak menjelaskan nihil pendapatan dan alasan penolakan. Halaman lacak serta dokumen cetaknya menegaskan bahwa skor awal bukan hasil cek ulang kiriman yang ditolak; catatan bebas dan foto pembeli tetap tidak masuk proyeksi publik.

## Alur tur juri yang sudah diverifikasi

Mulai dari `/juri`, pilih **Kembalikan data demo ke awal**, konfirmasi, lalu **Mulai tur**. Pilih **Selanjutnya** sesudah tindakan selesai; penanda tidak mengerjakan atau memeriksa tindakan secara otomatis.

1. **Publik, `/coba`:** pilih Contoh 1. Mutu A (Prima), skor 8,4 dari 9. Batas model tersedia sebagai bacaan tambahan di `/tentang/model`.
2. **KUB, `/kub`:** cari TGK-A-0511, terisi 22/40 kg dan kurang 18 kg.
3. **KUB, `/kub/darat`:** pilih Darman, tongkol 18 kg, pakai es; foto mata Contoh 1; insang merah cerah, bau segar khas laut, tekstur agak lunak. Di HP, buka foto contoh terlebih dahulu. Masukkan 18 kg ke pesanan. Sheet tersimpan menampilkan 40/40 kg dan tautan ke tangkapan Darman. Tutup sheet sebelum melanjutkan tur.
4. **KUB, batch tongkol:** buat label QR, tutup label, buka Checklist kirim; centang es cukup, wadah tertutup, label tertempel, isi kurir Pak Udin, lalu Berangkat sekarang. Tautan penerimaan SPPG dan lacak publik muncul.
5. **Nelayan, `/nelayan`:** jawab cicilan Rp50.000 dari Pak Rusli **sebelum pembeli membayar**. Pilih Setuju untuk mengikuti angka berikut. Tidak setuju juga merupakan pilihan yang sah.
6. **Pembeli, `/pembeli/terima/TGK-A-0511`:** pilih Terima semua, lalu Terima 40 kg. Pembayaran simulasi Rp800.000 tercatat.
7. **KUB, `/kub/bayar`:** buka bagi hasil terbaru, lalu Lihat di HP nelayan · Pak Darman. Halaman Kenapa harganya segini menunjukkan 18 kg × Rp16.300 = Rp293.400 kotor; Rp243.400 bersih bila cicilan Rp50.000 disetujui, atau Rp293.400 bila ditolak. Tautan jejak kiriman tersedia.
8. **UMKM, `/umkm/bahan`:** periksa tautan Lihat asal, lalu buka Studio dan Produk baru. Ambil tongkol 12 kg setelah memeriksa bahan. Isi nama, merek, komposisi, periksa HPP, isi kode produksi, tanggal simpan, dan P-IRT contoh 206177101000126. Cetak terkunci sampai label valid. Susun teks, simpan produk, lalu lanjutkan tur.
9. **Publik, `/lacak/TGK-A-0511`:** periksa status diterima, asal ikan, nomor nelayan tersamar, dokumen mutu, dan cap SHA-256. Pilih Selesai untuk mengakhiri tur.

Tur lengkap dijalankan lewat kontrol UI pada 1366 dan 360 px, termasuk keputusan cicilan, Rp243.400 bersih, penyimpanan produk, dan privasi lacak. Alur penolakan dengan foto yang bertahan setelah reload, pesanan H-1, serta pencatatan tanpa sinyal juga tetap diuji.

## Data contoh tambahan

`src/data/seed/edge-cases.ts` ditambahkan **setelah** generator lama. Unit test membandingkan seluruh catatan lama beserta urutannya dengan hasil generator lama; tidak ada nilai lama atau ID e2e yang diubah.

| Kasus | Kode / ID | Hasil |
| :-- | :-- | :-- |
| SPPG menolak kiriman Darman, 3 Nov | `TGK-A-0311-R` / `batch-contoh-ditolak-sppg` | 10 kg, cek ulang 5,6, insang kusam/es hampir habis; tidak ada payment, income, atau potongan |
| SPPG batal karena tidak terpenuhi, 2 Nov | `CKL-B-0211-X` / `batch-contoh-batal-sppg` | Hanya 6/30 kg; batch dibatalkan, 6 kg Darman dialihkan ke TPI, tidak ada tagihan |
| SPPG membayar terlambat, 1 Nov | `KMB-A-0111-L` / `batch-contoh-terlambat-sppg` | 8 kg diterima, Rp160.000 dibayar 3 Nov setelah tenggat 2 Nov; pendapatan Joni sesuai bagi hasil dan tanggal pembayaran |
| Label belum lengkap | `produk-abon-tongkol-belum-lengkap` | P-IRT kosong dan contoh klaim menyembuhkan; penanda merah, cetak serta berbagi terkunci |

Pendaratan Darman mutu C dan asal bahan `bahan-darat-2026-10-29-darman` sudah tersedia dari benih lama, sehingga tidak diduplikasi. Total pembayaran terlambat kini dua: satu restoran lama, satu SPPG tambahan. Hanya tiga tes agregat keterlambatan disesuaikan dari 1 menjadi 2; tes nilai catatan tertentu tetap utuh. Locator foto penolakan e2e sekarang memilih batch CKL-B-0511 secara eksplisit agar tidak salah mengambil contoh penolakan baru.

Schema benih naik **3 → 4**. Saat versi lama ditemukan, repository mengganti database demo, memulai ulang jam demo, dan membersihkan draf Studio lama satu kali. Unit test memastikan kunjungan berikutnya mempertahankan versi 4 dan jam yang berjalan.

Kasus baru juga memperlihatkan dan memperbaiki total/sisa tagihan yang keliru pada penolakan/pembatalan, status tangkapan ditolak yang sebelumnya terlihat masih dalam kiriman, judul produk serta grid UMKM yang melebar di 360 px, dan target skip-link pada wizard pendaratan. Tidak ada library baru.

## Batas yang sengaja dinyatakan

- Semua perubahan hanya di browser/perangkat ini. Supabase Auth, RLS, Storage, dan antrean IndexedDB/sinkron server belum terhubung. Pesan pendaratan tidak lagi menjanjikan bahwa data terkirim ke server.
- Model mata/insang produksi, benchmark, dan evaluasi per spesies belum tersedia. Enam foto contoh memakai simulasi; `/tentang/model` menjelaskan batasnya.
- Tidak ada sensor suhu atau uji histamin. Catatan peti hangat adalah pengamatan manusia tanpa pengukuran. Skor organoleptik terbatas bukan sertifikat SNI atau jaminan keamanan pangan. Ikan ditolak tidak otomatis dibayar, diolah, atau dinyatakan aman.
- Harga, jam, pembayaran, dan bagi hasil adalah simulasi. Tidak ada pembayaran nyata, LLM, scraping harga, atau layanan eksternal baru.
- Label dapat disimpan sebagai PDF lewat cetak browser. Nomor izin hanya diperiksa formatnya; izin, komposisi, dan umur simpan harus ditetapkan serta diperiksa pemilik usaha. Nomor pada tur adalah contoh, bukan izin yang dapat dipakai berdagang.
- Foto bukti dan produk disimpan sebagai JPEG terkompresi. Kuota localStorage terbatas; kegagalan simpan diberi tahu. Jika penyimpanan ditolak, status tur juga hanya bertahan dalam memori sampai halaman dimuat ulang.
- QR kiriman baru tidak membawa database lokal ke perangkat lain. Integrasi server nantinya harus memakai proyeksi aman `queries/tracking.ts`; jangan membagikan seluruh database, alasan bebas, foto bukti, kontak, utang, atau harga pribadi.

## Hasil verifikasi gelombang 2

- `corepack pnpm install --frozen-lockfile`: lulus, lockfile tetap.
- `corepack pnpm lint`: lulus.
- `corepack pnpm typecheck`: lulus, termasuk pembuatan tipe route.
- `corepack pnpm test`: **198 tes pada 26 berkas lulus** (awal: 191 tes pada 25 berkas).
- `corepack pnpm build`: lulus; **15 halaman offline dan 78 aset** disiapkan.
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium corepack pnpm test:e2e --workers=2`: **24 tes lulus**, 12 desktop dan 12 HP. Mencakup tur sembilan langkah dari reset, lintas peran, reload/akhiri tur, penyimpanan ditolak, serta kasus tepi.
- Sweep **49 alamat pada 360 dan 1366 px: 98 tampilan**, HTTP 200, tanpa galat JavaScript/hydration atau overflow horizontal; masing-masing mempunyai satu h1 dan satu main dengan `id="main-content"`. Cakupan meliputi semua 38 pola rute serta 11 variasi detail kasus tepi.
- Tangkapan layar halaman yang berubah dan tahap tur diperiksa pada kedua lebar terhadap arah desain serta halaman `/kub` dan `/pembeli`. Grid UMKM dan judul panjang diperbaiki setelah pemeriksaan.
- `git diff --check`: lulus. CI remote belum dijalankan karena hasil berada di cabang kerja lokal.

## Catatan untuk pemilik

- Urutan usulan tur disesuaikan: keputusan cicilan menjadi langkah 5, sebelum pembeli membayar, karena permintaannya tidak lagi tampil di beranda nelayan setelah pembayaran. Rincian uang tetap diperiksa lewat tautan bagi hasil pada langkah 7. Tidak ada perubahan aturan bisnis demi memaksakan urutan tur.
- Model menjadi bacaan tambahan; studio dimulai dari daftar bahan agar asal ikan dapat diperiksa. Penanda tur adalah panduan yang dikendalikan juri, bukan deteksi otomatis bahwa setiap tugas selesai.
- Kasus baru memakai tanggal masa lalu dengan ID/kode sendiri, bukan mengubah generator acak, data lama, atau cerita pagi 5 November. Pesanan batal sekaligus melengkapi contoh Darman menjual ke TPI.
- Pergantian schema demo mengembalikan catatan/draf versi 3 ke data awal versi 4. Ini sengaja dilakukan agar pengunjung lama menerima contoh baru dan jam demo yang sesuai.
- Tiga unit kerja dicatat sebagai commit lokal terpisah; riwayat lama dipertahankan. Tidak ada merge ke main, push, atau deploy. ZIP handoff gelombang 3 memuat git bundle agar hasil dan riwayatnya dapat dibawa ke checkout berikutnya.
- Gelombang 3 (kerangka publik, landing, timeline lacak, kartu model, tentang, dan FAQ) belum dikerjakan. Handoff berikutnya menjelaskan perubahan yang harus dipertahankan dan contoh kode baru yang siap dipakai.
- Pemeriksaan izin/umur simpan, kamera fisik, printer termal, serta penggunaan dengan tangan basah, terik/subuh, dan HP Android murah tetap memerlukan tim/manusia di lapangan. Pengujian browser tidak menggantikannya.
