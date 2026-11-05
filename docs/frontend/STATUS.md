# Status frontend

Cabang `feat/frontend-ui`, 5 November 2026. Cakupan ini melengkapi antarmuka demo berdasarkan PRD dan wireframe; pekerjaan backend dan model terlatih tetap terpisah.

## Rute

Semua rute dari PRD §7 sudah mempunyai halaman, ditambah `/lacak` untuk memasukkan kode dan `/lacak/bahan/[id]` untuk asal bahan pada QR label olahan. Halaman tidak ditemukan dan pemulihan galat mempunyai tindakan yang jelas. Navigasi keyboard dapat melompati header ke isi.

## Alur verifikasi

1. **Juri:** buka `/coba`, pilih Contoh 1, lihat mutu A dan skor 8,4. Buka batas model dan periksa bahwa hasil masih simulasi.
2. **Operator:** pilih Darman, tongkol 18 kg, pakai es; Contoh 1 untuk mata; insang merah cerah; bau segar; tekstur agak lunak. Masukkan 18 kg ke TGK-A-0511 sehingga 22/40 menjadi 40/40. Buka label QR, centang checklist, dan kirim.
3. **Pembeli:** di `/pembeli/terima/TGK-A-0511`, terima semua. Simulasi pembayaran Rp800.000 masuk buku kas. Riwayat pembeli menyediakan dokumen dan faktur. Buat pesanan H-1 dari `/pembeli/pesan`.
4. **Penolakan:** buka kiriman cakalang yang sudah berangkat, pilih tolak/sebagian, isi alasan dan foto. Muat ulang; foto dan keputusan masih tersimpan. Operator dapat melihat bukti penolakan di halaman batch.
5. **UMKM:** buat produk baru, pilih 12 kg tongkol hari ini, periksa bahan, isi produk dan komposisi, periksa HPP, lengkapi kode produksi, tanggal simpan, dan nomor izin contoh. Cetak tetap terkunci sampai label dan modal valid. Susun teks dari isian, sunting, simpan, dan muat ulang.
6. **Offline:** pakai production build, buka aplikasi saat online dan tunggu service worker aktif. Matikan jaringan, catat pendaratan dan reload. Data lokal tetap ada. Bila penyimpanan ditolak/penuh, pesan tidak lagi mengaku tersimpan.
7. **Privasi lacak:** halaman dan ekspor mutu memakai nomor anggota tersamar. Kontak, utang, harga individual, dan data pembeli tidak masuk proyeksi publik. Cap SHA-256 memeriksa kecocokan catatan, bukan identitas pihak pencatat.

Tes browser menjalankan alur tersebut pada lebar 1366 dan 360 px. Unit test mencakup rumus skor, harga, bagi hasil, HPP, aturan label, reservasi bahan, privasi lacak, hash, dan penyimpanan lokal. CI tidak memerlukan kredensial atau layanan eksternal.

## Batas yang sengaja dinyatakan

- UI tidak mengklaim data telah tersinkron: semua perubahan hanya di perangkat/browser ini. Supabase Auth, RLS, Storage, dan antrean IndexedDB/sinkron server belum terhubung.
- Model mata/insang produksi, benchmark, dan evaluasi per spesies belum tersedia. `/tentang/model` menjelaskan algoritme aktif dan data contoh.
- Tidak ada sensor suhu atau uji histamin. Skor adalah penilaian organoleptik terbatas. Batas waktu dan grade dari PRD masih memerlukan validasi ahli.
- Tidak ada pembayaran nyata, LLM, scraping harga, atau keep-alive layanan yang belum dihubungkan. Angka harga seed dan jam bersifat simulasi.
- Label dapat disimpan sebagai PDF melalui cetak browser. Nomor izin hanya diperiksa formatnya; izin dan umur simpan harus ditetapkan pemilik usaha.
- Foto bukti dan produk disimpan sebagai JPEG terkompresi. Kuota `localStorage` terbatas, sehingga banner memberi tahu bila data hanya bertahan selama halaman terbuka. Perlu Storage/IndexedDB untuk penggunaan lapangan dengan banyak foto.
- QR baru tidak membawa database lokal ke perangkat lain. Integrasi publik server harus memakai proyeksi aman dari `queries/tracking.ts`, bukan mengirim seluruh `DemoDatabase`.

Uji tangan basah, panas/subuh, dan HP Android murah di dermaga tetap perlu dilakukan pada perangkat nyata; pemeriksaan browser desktop tidak menggantikannya.

## Hasil verifikasi

- `corepack pnpm typecheck`: lulus, termasuk pembuatan tipe route sebelum `tsc` untuk checkout baru
- `corepack pnpm lint`: lulus
- `corepack pnpm test`: 145 tes pada 20 berkas lulus
- `corepack pnpm build`: lulus; 14 halaman offline dan 62 aset disiapkan
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium corepack pnpm test:e2e --workers=2`: 16 tes lulus, laptop dan HP
- Sweep browser mencakup 15 rute pada kedua lebar; tidak ada galat JavaScript atau overflow horizontal
- Tampilan production halaman depan, label Studio, dan beranda operator diperiksa lagi setelah perbaikan

Kamera/mikrofon fisik, printer termal, dan penggunaan nyata di dermaga belum diuji di lingkungan ini.
