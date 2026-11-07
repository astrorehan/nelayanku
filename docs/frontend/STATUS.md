# Status frontend

Gelombang 2, 8 November 2026 WIB. Cabang kerja lingkungan: `work`, berdasarkan `feat/frontend-ui` pada `f46ac8a`. Gelombang 2 selesai; gelombang 3 disiapkan sebagai pekerjaan berikutnya, belum dikerjakan.

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
