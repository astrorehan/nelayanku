# UX NELAYANKU

Rencana pengalaman pengguna untuk semua peran. Wireframe ada di [`docs/wireframe`](wireframe/index.html) (buka `index.html` di browser). Ukuran acuan: HP murah 360×780 dan laptop 1366×768, karena dua perangkat itulah yang paling sempit di antara pengguna dan juri.

---

## 1. Prinsip

1. **Satu tugas per layar** untuk operator, nelayan, dan pengolah. Satu tombol utama, tinggi ≥56 px, selebar layar di HP.
2. **Tidak ada jawaban yang dipilihkan** untuk hal yang menyangkut keamanan pangan atau uang: status es, bau, tekstur, dan persetujuan potongan utang. Tombol lanjut aktif setelah semuanya dijawab.
3. **Teks ≥16 px di layar dermaga**, angka penting ≥28 px, target sentuh ≥48 px. Angka tidak boleh terpotong ke baris kedua.
4. **Setiap angka punya asal-usul.** Angka simulasi diberi tanda `simulasi` yang terlihat, bukan hanya catatan kaki.
5. **Bahasa sehari-hari.** "Pesanan" untuk batch, "kiriman" untuk barang yang dikirim, "cap keaslian data" untuk hash, "nilai ikan" untuk grading.
6. **Ikon selalu berlabel.** Tidak ada gestur geser. Lembar bawah ditutup dengan tombol "Tutup", bukan diseret.

## 2. Peta halaman dan navigasi

| Peran | HP | Laptop/tablet |
| :-- | :-- | :-- |
| Publik | Header: logo, Masuk, Menu | Header: Cara kerja, Siapa membayar, Cara AI menilai, Lacak kiriman, Masuk. Saat digulir, tombol "Coba nilai ikan" ikut menempel. |
| Operator KUB | Tab bawah: Beranda, Bayar, Dampak. Tombol besar "Catat pendaratan" di Beranda. | Sidebar: tombol "Catat pendaratan", lalu Beranda, Bayar & buku kas, Dampak |
| Nelayan | Satu halaman | Satu halaman, kolom tengah |
| Pembeli | Satu kolom dengan tombol utama di bawah | Header: Pesanan, Pesan baru |
| Pengolah UMKM | Studio 5 langkah: Bahan, Produk, Modal, Label, Teks jualan | Langkah yang sama, dengan pratinjau label di samping |

Rute tambahan di luar PRD §7: `/lacak` (isi kode atau pindai QR) karena menu "Lacak kiriman" butuh halaman masuk.

**Mode demo.** Tombol kecil "Demo" di setiap halaman berperan membuka lembar berisi: ganti peran, kembalikan data demo, dan penjelasan bahwa data serta jam adalah simulasi (Kamis, 5 November 2026, 05.41 WIB). Jam simulasi berjalan sejak juri membuka demo, sehingga jam segar ikut menghitung mundur.

## 3. Alur utama dan batas ketukan

### Catat pendaratan (operator)

| Langkah | Isi | Ketukan |
| :-- | :-- | --: |
| 1. Nelayan | Kisi 12 nelayan dengan ikan yang biasa ia bawa | 1 |
| 2. Ikan dan berat | Jenis ikan terisi dari kebiasaan nelayan dan tetap bisa diganti. Papan angka. Pertanyaan es tanpa jawaban bawaan. | 2–3 angka + 1 es + 1 lanjut |
| 3. Foto | Satu layar: mata, lalu insang. Memotret otomatis saat gambar jelas. Tombol potret, unggah, dan foto contoh tetap ada. | 0–2 |
| 4. Bau dan tekstur | Dua pertanyaan, masing-masing 4 pilihan, tanpa jawaban bawaan | 3 |
| 5. Hasil dan tujuan | Grade, skor, 4 parameter, harga wajar satu baris, pesanan yang disarankan | 1 |

- **Catat pendaratan (langkah 1–2): ≤5 ketukan** untuk berat bulat, sesuai F-10.
- **Pendaratan + penilaian lengkap: ≤12 ketukan.**
- Satu ikan sampel secara bawaan. Tambah sampel (F-14) ditawarkan setelah hasil pertama.
- Setelah tersimpan: lembar ringkas berisi "Catat pendaratan berikutnya" dan "Kirim ringkasan ke WA nelayan".

### Pesanan sampai kiriman (operator)

Tombol utama di halaman pesanan berubah mengikuti status, jadi selalu hanya ada satu: **Tambah dari pendaratan → Buat label QR → Checklist kirim → Berangkat sekarang**. Label disimpan sebagai PDF atau dibagikan lewat WA lebih dulu, mencetak jadi pilihan kedua, karena tidak semua dermaga punya printer.

### Pembeli

- Pesan untuk besok: satu formulir, ringkasan di samping (laptop) atau di bawah (HP), rincian harga ke nelayan bisa dibuka.
- Terima kiriman: tiga pilihan tampil bersamaan (terima semua, sebagian, tolak). Tolak wajib alasan dan foto, lalu masuk antrean sengketa KUB.

### Nelayan

Satu keputusan di paling atas: persetujuan potongan utang, dengan angka yang disetujui sebagai angka terbesar dan akibat dari setiap pilihan ditulis lengkap. Di bawahnya uang terakhir, sisa utang, dan riwayat.

## 4. Keadaan yang wajib dirancang

| Area | Keadaan |
| :-- | :-- |
| AI di browser | Memuat model pertama kali (dengan ukuran unduhan), browser tidak mendukung, foto ditolak (buram, gelap, silau), kamera tidak diizinkan |
| Hasil penilaian | Grade C ke olahan, tolak (tidak ada jalan ke penjualan), grade bagus tetapi tanpa es (tidak bisa ke dapur SPPG), melebihi target kg |
| Pesanan | Belum penuh saat batas waktu (kirim sebagian, gabung KUB lain, jual ke TPI), tidak ada pesanan hari ini |
| Sinyal | Tanpa sinyal: "tersimpan di HP, dikirim saat ada sinyal". Antrean gagal terkirim. |
| Lacak | Kode tidak ditemukan |
| Studio | Mikrofon tidak diizinkan, AI teks gagal atau kuota habis (pakai template), label belum lengkap (tombol cetak nonaktif dengan alasan) |

## 5. Data demo yang konsisten

Data simulasi harus bisa diperiksa silang oleh juri yang skeptis:

- Pesanan Tongkol A untuk Dapur SPPG Kampung Melayu terisi 22/40 kg dari Pak Joni (14 kg) dan Pak Herman (8 kg), keduanya grade A dan memakai es. Pak Darman (18 kg) adalah pendaratan yang dicatat juri sendiri.
- Tongkol Pak Zainal didaratkan 03.31 tanpa es dan belum dinilai. Ini peringatan di Beranda dan contoh aturan histamin.
- Untuk dapur SPPG dengan harga Rp20.000/kg, nelayan menerima Rp16.300/kg (+25% dibanding TPI). Untuk restoran, biaya layanan 2% berlaku sehingga nelayan menerima Rp15.900/kg (+22%).
- Angka dampak dihitung dari transaksi data demo, termasuk satu pembayaran yang terlambat, bukan angka hiasan.

## 6. Perubahan setelah review wireframe

Wireframe versi pertama ditinjau secara independen untuk mencari layar yang sesak atau membebani. Temuan utama dan keputusannya:

| Temuan | Keputusan |
| :-- | :-- |
| Alur dermaga 9 layar, nomor langkah tidak konsisten, 3 ikan sampel × 2 foto | 5 langkah dengan nomor jujur, 1 sampel bawaan, foto otomatis |
| Es, bau, dan tekstur sudah terpilih | Tanpa jawaban bawaan, tombol lanjut nonaktif sampai dijawab |
| Data demo melanggar aturan es sendiri | Data disusun ulang (lihat bagian 5) |
| Kartu persetujuan nelayan memuat dua potongan berbeda | Satu potongan, angka terbesar, akibat setiap pilihan ditulis |
| Teks dan target sentuh di bawah aturan PRD §12 | Batas 16 px, 28 px, dan 48 px diterapkan ke semua layar dermaga |
| Layar hasil + tujuan terlalu padat | Digabung jadi satu layar dengan harga wajar satu baris yang bisa dibuka |
| Angka simulasi di halaman depan hanya ditandai catatan kaki | Tanda `simulasi` terlihat di grafik, sumber untuk setiap angka |
| Kartu model kosong ("menunggu") | Pernyataan jujur "belum diuji, ini target", batasan ditaruh paling atas |
| Tab sempit di Studio dan halaman pesanan | Diganti langkah bernomor dan satu halaman gulir |
