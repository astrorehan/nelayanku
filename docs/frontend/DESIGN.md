# Polesan antarmuka

## Arah

- Produk: buku kerja KUB nelayan kecil, dari pendaratan sampai pembayaran dan olahan
- Karakter: kokoh, terbaca, hangat
- Dunia: label kiriman, catatan timbangan, dan buku kas di dermaga
- Momen: perbandingan harga dan hasil penilaian ikan; warna mutu selalu punya arti
- Penanda: mata emas pada tanda ikan yang sudah ada

Identitas, keluarga huruf, palet, susunan halaman, dan target sentuh dermaga dipertahankan. Ini polesan sistem yang sudah ada, bukan penggantian brand.

## Temuan dan perbaikan

| Temuan | Perbaikan |
| :-- | :-- |
| Judul dan hampir semua label memakai bobot 700–800 | Judul 500, penekanan 600; ukuran dan ruang menjadi hierarki |
| Label kecil kapital dengan jarak huruf lebar | Sentence case tanpa tracking tambahan |
| Angka harga mulai menghitung dari nol saat halaman dibuka | Harga langsung terbaca; format rupiah dan angka tabular tetap konsisten |
| Grafik batang memakai ujung pil dan animasi lebar | Batang tenang; meter mengubah transform, bukan ukuran layout |
| Stempel hasil memantul, berputar, dan mengeluarkan lingkaran | Hasil muncul singkat tanpa overshoot atau dekorasi baru |
| Tiap bagian disembunyikan sampai animasi scroll | Konten langsung tersedia, termasuk saat dicetak dan tanpa JavaScript |
| Klaim model/offline mendahului implementasi | Keterangan model simulasi terlihat; foto unggahan dinilai manual |
| Font diambil dari Google saat build | WOFF2 Latin disimpan lokal, sehingga build dan penggunaan tidak bergantung Google Fonts |

## Sistem

Jarak utama memakai kelipatan 4 px. Kontrol dermaga tetap ≥48 px, tombol utama ≥56 px, isi ≥16 px. Kontras palet dari `BRAND.md` dipertahankan. Ikon memakai set proyek yang sama dengan stroke 1,5. Emas hanya penanda atau sorotan kecil; kelas mutu dan peringatan tetap memakai warna semantik beserta kata.

Huruf lokal berasal dari paket `@fontsource-variable` versi 5.3.0: Atkinson Hyperlegible Next, Atkinson Hyperlegible Mono, dan Bitter. Lisensi OFL disimpan bersama berkas huruf.

Metode audit dan polesan memakai [unslop oleh Damir Sokolovsky (@heydamir)](https://github.com/heydamir/unslop), CC BY 4.0. Catatan ini mengadaptasi metode, tanpa menyalin visual contoh. Tidak ada gambar generatif baru.

## Penutup sembilan lapisan

1. **Jarak:** grup dan daftar memakai ritme komponen yang sama; pilihan bahan baru dibatasi bahan hari ini dan sumber produk yang sedang dibuka, sehingga riwayat lama tidak membuat layar awal terlalu panjang.
2. **Warna:** palet Tinta/Kertas/Emas tetap, dengan warna mutu hanya untuk makna. Badge simulasi menjadi catatan kecil dengan garis tenang.
3. **Ikon:** set tanda proyek tetap dipakai, stroke seragam 1,5; ikon tindakan utama 18 px. Tidak ditambahkan emoji dekoratif.
4. **Teks:** judul operator menyebut konteks dermaga. Hasil simulasi, batas model, penyimpanan lokal, dan asal angka diperjelas; model card mengikuti rumus yang benar-benar dipakai kode.
5. **Huruf:** keluarga huruf brand tetap; bobot judul dan angka diturunkan, label kapital dihilangkan, angka memakai tabular.
6. **Susunan:** urutan landing dan shell aplikasi dipertahankan. Studio memakai lima langkah dan pratinjau label di samping pada desktop, satu kolom pada HP. Filter pembeli diperbaiki untuk 360 px.
7. **Rincian:** tombol lebih tegas dengan radius proporsional, badge status ringkas, label cetak dan dokumen memakai isi nyata dari data demo. Tautan loncat isi dan pemulihan galat tersedia.
8. **Visual:** grafik harga dan cuplikan penilaian tetap menjadi pembuktian produk. Tidak ada gambar atau adegan baru; tidak ada prompt generasi gambar.
9. **Gerak:** konten landing langsung terlihat; stempel tidak lagi memantul atau berputar. Meter memakai transform. Respons gerak tetap menghormati reduced motion.

Pemeriksaan akhir dilakukan pada production build, termasuk lebar HP 360 px. Laporan pengujian dan batas integrasi ada di `STATUS.md`.
