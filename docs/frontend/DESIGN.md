# Arah visual Nelayanku

## Gagasan

Buku kerja koperasi di dermaga: barang datang dengan berat, mutu, tujuan, dan pemilik yang jelas. Identitas hidup pada cara informasi dicatat, selain tanda ikan bermata emas.

- **Produk:** mencatat mutu tangkapan, memenuhi pesanan, dan membagi pembayaran untuk KUB nelayan kecil
- **Karakter:** teliti, membumi, terus terang
- **Dunia:** catatan timbang, label peti es, dan kuitansi bagi hasil
- **Momen:** hasil tangkapan pada hero; bagian nelayan pada catatan harga; hasil penilaian pada catatan mutu
- **Penanda:** mata emas kecil dan kepala dokumen bergaris Tinta, dipakai pada catatan yang perlu dibaca sebagai bukti

## Masalah yang diperbaiki

Versi sebelumnya memakai bentuk kartu, radius besar, dan kekuatan label yang hampir sama untuk semua isi. Akibatnya hubungan antartugas kurang terasa dan logo menjadi satu-satunya pembawa identitas. Judul harga di HP terpecah dengan canggung; angka uang memakai nol bergaris yang lebih cocok untuk kode.

## Sembilan lapisan

1. **Jarak.** Catatan pesanan memakai satu ritme 24 px, pendaratan memakai baris 80 px dengan jam, nama, berat, dan mutu yang sejajar. Ruang mengelompokkan isi; setiap kelompok tidak lagi membutuhkan kotak.
2. **Warna.** Tinta, Kertas, dan Emas tetap menjadi palet. Emas menandai mata, navigasi aktif, dan tindakan utama pada sidebar. Latar operator tetap netral; warna mutu hanya membawa arti kelas.
3. **Ikon.** Ikon set proyek tetap, stroke 1,5. Ikon tidak membungkus setiap label. Avatar berinisial yang berulang pada log pendaratan diganti jam darat yang berguna.
4. **Teks.** Hero menjelaskan asal ikan dan bagian nelayan. Operator mendapat judul Catatan dermaga, jumlah pendaratan, berat aktual, pesanan yang perlu diisi, dan peringatan ringkas yang menyebut ikannya.
5. **Huruf.** Atkinson tetap untuk kerja dan kontrol, Bitter untuk judul konteks, nama ikan dalam dokumen, dan angka Rupiah besar. Kode/jam memakai Mono. Tipe tidak diganti dengan satu font tren yang baru.
6. **Susunan.** Operator memakai lembar catatan terbuka, pesanan aktif didahulukan sebelum kiriman yang sudah berangkat. Bagian pendaratan berbentuk log. Landing mempertahankan urutan bagian, dengan satu visual dan catatan harga di sisi pesan utama pada desktop. HP tetap satu kolom.
7. **Rincian.** Stempel mutu datar tanpa kilap dan sudut besar. Catatan mutu/harga memakai garis kepala yang sama. Kontrol tetap ≥48 px, tindakan utama ≥56 px, dan instruksi kerja tetap ≥16 px.
8. **Visual.** Satu ilustrasi peti tongkol di atas es menghubungkan halaman publik ke pekerjaan nyata yang dijelaskan produk. Keterangan Ilustrasi tidak mengklaim lokasi atau penangkapan sungguhan. Asal aset dan prompt ada di `ASSETS.md`.
9. **Gerak.** Tidak ada objek melayang, looping, atau perpindahan tata letak untuk hiasan. Data langsung bisa dibaca. Reduced motion tetap dihormati.

## Penerapan

- Beranda KUB, log pendaratan, urutan pesanan, header dan navigasi mobile/desktop
- Hero dan catatan harga, tiga tahap kerja, bagian pembayar, dan catatan mutu publik
- Stempel, radius wadah/formulir, angka pembayaran/HPP, dan hasil grading memakai bahasa visual yang sama
- Logo asli, warna kelas mutu, fungsi, data, aksesibilitas sentuh, dan sumber angka dipertahankan

Pemeriksaan meliputi build production, lint, TypeScript, dan alur browser pada 360 px serta 1366 px. Hasil fungsional ada di `STATUS.md`.

Metode audit mengikuti [unslop oleh Damir Sokolovsky (@heydamir)](https://github.com/heydamir/unslop), CC BY 4.0. Arah visual diturunkan dari aktivitas Nelayanku; subjek dan susunan referensi tidak disalin.
