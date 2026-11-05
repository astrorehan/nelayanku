# Evaluasi Ide NELAYANKU — IT RUSH 2026 (Web Dev)

Versi 2, 4 November 2026. Dasar penilaian: Guidebook IT RUSH 2026, template proposal dan surat orisinalitas resmi, dan riset web (`RISET.md`).

---

## Ringkasan

**Idenya layak dipakai dan bisa menang. Syaratnya, ide ini dibangun sebagai sistem yang tahan terhadap juri paling skeptis, bukan sebagai demo AI yang hanya memukau dua dari tiga juri.**

- **Perkiraan skor (rata-rata 3 juri, salah satunya skeptis):** ide awal Ammar **±73**, versi tahan banting **±86**. Rinciannya ada di bagian 9.
- **Prinsip utama:** penilaiannya rata-rata tiga juri, jadi satu juri yang memberi nilai rendah bisa menjatuhkan skor. Karena itu, setiap keberatan yang mungkin muncul harus sudah dijawab di tempat yang pasti dilihat juri (bagian 2).
- **Lima keputusan yang paling menaikkan skor:**
  1. **Satu rantai, bukan tiga fitur.** Grade A/B masuk batch pembeli institusi, grade C masuk olahan ibu-ibu lalu Studio UMKM, dan grade Tolak bukan untuk konsumsi.
  2. **Pesanan dulu, baru tangkap.** Pembeli institusi memesan H-1, karena ikan tidak bisa menunggu pembeli.
  3. **Bisnisnya bertumpu pada satu angka yang bisa diuji.** Nelayan untung kalau pembeli institusi membayar ≥Rp16.700/kg untuk tongkol grade A, padahal harga eceran Rp30.000/kg. Angka ini diuji lewat wawancara selama 16 hari pengembangan. Pembeli jangkarnya **dapur SPPG (MBG)**, yang menurut Peraturan BGN 10/2026 wajib melibatkan pemasok lokal seperti koperasi dan KDMP, ditambah restoran untuk ikan grade A. Lokasi pilot: KNMP Penago I, Seluma.
  4. **AI sebagai alat, bukan bintang.** Skor gaya SNI 2729 dihitung di browser (jalan offline), akurasinya dilaporkan jujur, dan operator bisa mengoreksinya.
  5. **Demo yang tidak bisa gagal.** Coba tanpa login, foto contoh, akun per peran, keep-alive, dan tidak bergantung pada server AI yang bisa tertidur.
- **Tenggat:** 20 November 2026, 23.59 WIB (Gelombang 2).

---

## 1. Fakta lomba yang mengikat

Detail lengkap ada di `PANDUAN_LOMBA.md`. Yang paling menentukan strategi:

| Fakta | Akibatnya |
| :-- | :-- |
| Latar belakang guidebook menyebut **"lingkungan pesisir, hutan tropis, serta penguatan kesejahteraan masyarakat"** yang butuh AI | Ide pesisir sangat relevan. Subtema yang dipilih: **Ekonomi dan Pemberdayaan Masyarakat**. |
| Penyelenggara HIMATIF **Universitas Bengkulu** (provinsi pesisir) | Data dan cerita Bengkulu (Pulau Baai) jadi nilai tambah |
| Penilaian **asinkron, tanpa presentasi**. Juri mencoba live website, membaca kode, menonton video, membaca proposal. | Tidak ada kesempatan menjelaskan. Semuanya harus terbaca sendiri. |
| Rubrik: Fungsionalitas 25, Inovasi & Ketepatan 20, Relevansi & Dampak 15, UI/UX 15, Kode 15, Dokumentasi 10 | 40% bobot ada di fungsi + kode, jadi aplikasi harus benar-benar jalan dan kodenya rapi |
| Template proposal BAB II meminta **USP, Target Market, Monetisasi** | Juri memang menilai sisi bisnis. Lihat `MODEL_BISNIS.md`. |
| Surat orisinalitas: karya **"belum pernah dipublikasikan atau diikutsertakan dalam kompetisi lain sebelumnya"** | NELAYANKU ditulis sebagai kode baru dari nol |
| Riwayat commit tidak boleh dimanipulasi, dan juri memeriksa kode | Commit kecil dan natural sejak hari pertama |

## 2. Menang di mata juri paling skeptis

Yang perlu dijaga adalah **nilai minimum dari juri mana pun**. Dengan rata-rata tiga juri, satu nilai 60 bisa menghapus keunggulan 10 poin dari dua juri lain.

**Pola umum kenapa satu juri memberi nilai jauh lebih rendah** (dari pengamatan umum lomba software):
1. **Demo gagal saat juri itu yang mencoba**, misalnya server AI tertidur, login gagal, atau data kosong. Di penilaian asinkron, setiap juri mencoba di waktu yang berbeda.
2. **Juri berlensa bisnis atau lapangan** tidak menemukan jawaban "siapa yang mau pakai dan siapa yang membayar".
3. **Klaim berlebihan** (akurasi 99%, "siap ekspor", puluhan fitur) memancing juri skeptis untuk menghukum.
4. **Nilai produk tidak tertangkap dalam satu menit**, karena juri sibuk menilai banyak karya.
5. **Kode terlihat dibuang sekaligus** (commit raksasa, tanpa tes), sehingga juri kode curiga.
6. **Inovasi terlihat seperti "YOLO lagi".** Proyek deteksi mutu dengan AI sudah sangat umum di kalangan mahasiswa.

**Prinsip NELAYANKU: tidak ada kriteria yang lemah.** Setiap keberatan dijawab di tempat yang pasti dilihat juri.

### Matriks keberatan juri

| Keberatan juri skeptis | Jawaban kita | Di mana juri melihatnya |
| :-- | :-- | :-- |
| "Siapa yang mau membayar? Ini cuma proyek sosial." | Harga impas Rp16.700/kg vs eceran Rp30.000/kg, aliran pendapatan berlapis, pembeli jangkar, hasil wawancara | Proposal 2.4, kartu **rincian harga** di aplikasi, video menit ke-4 |
| "Nelayan tidak akan memakai aplikasi." | Pengguna utamanya **operator KUB**. Nelayan cukup menerima WhatsApp. Ada pendamping digital (mahasiswa). | Proposal 2.3, persona, video |
| "Nelayan terikat utang ke toke, jadi aplikasi tidak mengubah apa-apa." | Buku kas transparan, DP pesanan sebagai modal melaut, toke sebagai mitra pengumpul | Aplikasi (buku kas), proposal |
| "Akurasi AI-nya? Foto di dermaga kondisinya beda." | 3 kelas saja, model card jujur dengan akurasi per spesies, quality gate, operator bisa mengoreksi, skor parsial 4 dari 6 parameter SNI | `/tentang/model`, video |
| "Ikan cepat busuk, logistiknya bagaimana?" | Pesanan H-1, jam segar, cold storage Kampung Nelayan Merah Putih | Aplikasi (pesanan, jam segar), proposal |
| "Apa bedanya dengan Aruna atau Fishku?" | Tabel pembeda (bagian 6) | Proposal 2.2 |
| "Fiturnya kebanyakan, pasti setengah jadi." | Satu cerita utuh, plus daftar **"yang sengaja tidak kami kerjakan"** | README, proposal |
| "Angkanya karangan." | Setiap angka berlabel sumber dan tanggal, data demo berlabel "simulasi", ada log wawancara | Aplikasi, proposal, `RISET.md` |
| "Webnya error waktu saya coba." | Model di browser, keep-alive, tombol reset demo, uji ulang 27 Nov | Website live |
| "Kodenya hasil generate sekaligus." | Commit kecil, PR, tes rumus skor dan harga, CI | Repo |
| "Bagaimana dengan keamanan pangan?" | Grade Tolak tidak bisa dijual, dan ambang grade divalidasi dosen perikanan. Untuk tongkol, cakalang, dan tuna, es dan batas jam wajib dicatat, karena skor organoleptik tidak mengukur histamin. | Aplikasi, proposal |
| "SPPG tidak boleh ada perantara atau komisi." | Betul. Kanal SPPG tanpa biaya per transaksi. Pemasok resminya KUB, koperasi, atau KDMP berbadan hukum, dan NELAYANKU dibayar lewat langganan KUB. | Proposal 2.4, rincian harga (baris biaya layanan Rp0 untuk SPPG) |
| "Kenapa tidak jualan langsung ke konsumen saja?" | TaniHub dan Sayurbox sudah membuktikan B2C pangan segar sulit. Kami hanya melayani pembeli institusi. | Proposal 2.3 |

### Yang sengaja tidak dikerjakan (dan ditulis terang-terangan)

Payment gateway sungguhan (pembayaran disimulasikan), sensor IoT suhu, tebakan jenis ikan otomatis, klaim "siap ekspor", marketplace untuk konsumen umum, dan model AI untuk hasil hutan (produk hutan cukup lewat Studio). Menulis batasan ini membuat juri skeptis percaya pada klaim yang tersisa.

## 3. Posisi ide: bagian-bagian NELAYANKU

| Bagian NELAYANKU | Isinya |
| :-- | :-- |
| Grading AI & harga | Model kesegaran ikan dengan quality gate, skor gaya SNI 2729, rumus harga transparan, harga PIPP/Bapanas, hash audit, model di browser |
| Batch & pengiriman | Pesanan H-1, batch per jenis+grade, label QR, halaman lacak, jam segar, cek ulang saat diterima, jalan offline |
| Bagi hasil & buku kas | Bagi hasil per nelayan, utang transparan yang disetujui nelayan |
| Studio UMKM | LLM + validator label PerBPOM, kalkulator HPP |

## 4. UX dan keterbatasan nelayan

**Temuan utama:** pengguna harian aplikasi ini bukan nelayan di tengah laut. Penggunanya adalah orang-orang di **dermaga pada saat pendaratan**: operator KUB (sering istri nelayan), nelayan yang baru pulang, dan pengolah. Desainnya harus pas untuk momen sekitar 15 menit di dermaga itu.

| Keterbatasan nelayan (fakta) | Akibatnya untuk desain | Desain di NELAYANKU |
| :-- | :-- | :-- |
| **Terikat toke.** Kota Bani: 90% menjual ke toke dan menerima harga apa adanya. Seluma: 96,77% bergantung pada tengkulak/pengepul, 77,42% berutang. | Info harga saja tidak cukup, karena nelayan tidak bebas pindah pembeli selama utangnya belum lunas | Bukan "memotong tengkulak". Harga acuan di samping kolom "tawaran toke", **buku kas transparan**, **DP pesanan sebagai modal melaut** (BBM >60% biaya kapal kecil di Pulau Baai), toke boleh jadi mitra pengumpul |
| **Tanpa pendingin.** 85% nelayan Kota Bani tidak punya cool box. | Batch tidak bisa menunggu pembeli datang | **Pesanan H-1**, batch diisi saat pendaratan, **jadwal es dan cool box bersama** di KUB atau Kampung Nelayan Merah Putih |
| **TPI Pulau Baai berjalan**, tapi tongkol Rp13.000/kg di TPI vs Rp30.000/kg di pengecer, sehingga bagian nelayan ±43% | Batch harus mengalahkan harga TPI, bukan cuma harga toke | Jual grade A langsung ke pembeli institusi dengan harga di antara TPI dan eceran. Tampilkan perbandingannya di rincian harga. |
| **Usia & pendidikan.** Survei 220 nelayan kecil: rata-rata 45 tahun, sekolah 6,5 tahun, 61,4% memakai internet. Kota Bani: 50% tamat SD. | Formulir panjang dan teks padat tidak akan dipakai | 1 foto + 2 ketukan. Ikon dan angka besar, bahasa sehari-hari, input suara, ringkasan lewat WhatsApp. |
| **Sinyal.** Pejabat KKP menyebut sinyal sebagai kendala utama aplikasi e-PIT. Nelayan Pinrang menyebut biaya, sinyal, dan literasi digital sebagai hambatan. | Aplikasi tidak boleh bergantung pada server saat di dermaga | Model AI di browser, antrean offline, foto dikompres sebelum dikirim |
| **Perempuan memegang pascapanen.** 61% pekerja pascapanen perikanan adalah perempuan. Di Seluma, 80,65% keluarga melibatkan istri mengatur keuangan. | Nelayan bukan satu-satunya pengguna | Operator KUB, Studio UMKM, dan buku kas yang bisa dipegang istri |
| **Tangkapan kecil.** 92,7% kapal perikanan Indonesia adalah kapal kecil. | Satu nelayan tidak bisa memenuhi pesanan restoran sendirian | Batch gabungan per jenis ikan dan grade, dengan meteran isi |
| **Kondisi dermaga** (pengamatan umum): tangan basah, subuh gelap, siang silau | Tombol kecil dan kontras rendah akan gagal | Target sentuh ≥48 px, kontras ≥7:1, tombol senter, tanpa gestur geser |

### Kritik per fitur ide awal, dan perbaikannya

**Fitur 1 — AI Grading & Harga.** Ide awalnya memotret ikan lalu AI memberi grade dan harga.
- Satu nelayan membawa satu keranjang berisi puluhan ekor. Jadi nilailah **3 ikan sampel per keranjang**.
- **SNI 2729** menilai 6 parameter (mata, insang, lendir, daging, bau, tekstur) dengan skala 1–9 dan nilai minimal 7. Foto hanya bisa menilai **mata dan insang**, sedangkan **bau dan tekstur** diisi lewat 2 ketukan. Hasilnya **skor organoleptik parsial** yang ditulis jujur di UI.
- Harga disajikan sebagai **rentang wajar** dengan sumber (PIPP untuk harga pelabuhan, Bapanas untuk harga konsumen), ditambah kolom "tawaran toke hari ini". Klaim "prediksi harga" diganti menjadi "tren 30 hari".

**Fitur 2 — Smart Cold-Chain & Batch Aggregator.** Ide awalnya menggabungkan hasil panen lalu dijual ke restoran atau eksportir.
- Ikan tidak bisa menunggu pembeli, jadi **pesanan masuk dulu (H-1)**.
- "Smart cold chain" tanpa sensor adalah klaim yang mudah diserang. Ganti dengan **checklist es, jam segar, dan cek ulang saat diterima**. Tulis jujur bahwa versi ini belum memakai sensor IoT.
- "Eksportir" dibuang dari demo, karena ekspor butuh sertifikasi yang jauh di luar jangkauan KUB kecil. Fokusnya pembeli institusi lokal.

**Fitur 3 — Studio UMKM.** Ide awalnya mengubah olahan menjadi "produk siap ekspor" lewat generator label, HPP, dan copywriting.
- Ganti "siap ekspor" dengan **"siap jual ke toko oleh-oleh dan marketplace"**.
- Label disusun LLM, tetapi diperiksa **validator aturan PerBPOM 31/2018** (Pasal 5 untuk isi wajib, Pasal 36 untuk tulisan "P-IRT"). LLM dilarang mengarang nomor izin, klaim halal, atau klaim kesehatan.
- Bahan bakunya diambil dari **ikan grade C** di Fitur 1. Inilah yang menyatukan tiga fitur menjadi satu rantai.
- Unsur "hutan tropis" (madu, kopi) cukup masuk lewat Studio, karena studionya tidak bergantung pada jenis komoditas.

## 5. Konsumen dan bisnis

Detail lengkap ada di `MODEL_BISNIS.md`. Intinya:

- **Yang membayar adalah pembeli institusi**, lewat biaya layanan yang sudah masuk dalam harga, ditambah KUB lewat langganan Pro dan program pemerintah/CSR lewat kontrak implementasi. Nelayan dan UMKM **gratis selamanya**.
- **Angka penentu:** nelayan menerima minimal harga TPI kalau pembeli membayar ≥Rp16.700/kg (rumus: 0,87 × harga − Rp1.500). Pada harga pembeli Rp20.000/kg, nelayan menerima Rp15.900/kg, atau **+22% dibanding TPI**, dan pembeli tetap membayar jauh di bawah harga eceran Rp30.000.
- **Tidak terjebak "ayam dan telur":** mulai dari alat yang sudah berguna tanpa pembeli (pendaratan, grading, buku kas), lalu 1–3 pembeli jangkar, lalu replikasi ke desa Kampung Nelayan Merah Putih.
- **Jujur soal skala:** biaya layanan di satu pelabuhan hanya ±Rp124 juta/tahun (5% pendaratan Pulau Baai). Bisnisnya hidup dari banyak KUB ditambah kontrak program, dan ini ditulis terang di proposal.
- **Validasi selama pengembangan:** 5 pembeli, 3 nelayan atau pengepul, 2 pengolah, dan 1 dosen perikanan. Kutipan mereka menjadi senjata di proposal dan video.

**Pembeli jangkar yang punya dasar aturan: dapur SPPG (MBG).**
- Ada 27.022 SPPG aktif (Sep 2026) [V].
- Peraturan BGN 10/2026 mewajibkan SPPG melibatkan pemasok lokal mulai dari kecamatannya, termasuk koperasi dan KDMP. Hasil perikanan termasuk produk yang diprioritaskan [S].
- Akibatnya ada dua hal: penjualnya harus **KUB, koperasi, atau KDMP berbadan hukum**, dan kanal SPPG **tidak boleh dikenai komisi**, sehingga NELAYANKU dibayar lewat langganan KUB.
- Celahnya: ikan tangkap laut belum banyak masuk ke SPPG. Yang didorong KKP sejauh ini ikan budidaya.

**Lokasi pilot:** KNMP Penago I (Seluma). Fasilitas cold storage, pabrik es, dan balai lelangnya sudah dibangun pemerintah, dan 77% nelayan Seluma dalam survei berutang.

**Pelajaran dari startup nyata** (detail di `MODEL_BISNIS.md` §1):
- Jangan menjual ke konsumen umum (TaniHub, Sayurbox).
- Jangan meminjamkan uang (TaniFund).
- Semua angka harus bisa diaudit (eFishery).
- Jangan punya gudang atau armada sendiri (TaniHub, Sayurbox).
- Hemat biaya sejak awal (Aruna).

## 6. Pemain yang sudah ada, dan pembeda NELAYANKU

| Pemain | Yang dilakukan | Bedanya dengan NELAYANKU |
| :-- | :-- | :-- |
| Aruna | Rantai pasok hasil laut untuk ekspor (tuna, kepiting, lobster). Restrukturisasi Maret 2025. | Fokus ekspor. Tidak ada grading foto harian untuk nelayan kecil. |
| Laut Nusantara (KKP & XL) | Lokasi tangkap, cuaca, harga ikan di pelabuhan | Hanya informasi. Tidak ada grading, batch, atau penjualan. |
| Fishku (Bangkit 2022) | Marketplace ikan untuk konsumen + deteksi kesegaran | Pembanding terdekat. Fishku menjual ke konsumen (B2C), NELAYANKU melayani KUB dan pembeli institusi (B2B) dengan skor SNI, buku kas, dan kanal olahan. |
| SiCerdik (IPB) | Cek kesegaran dari foto mata ikan | Hanya cek kesegaran |
| Iwak / MetaSeaco (Pertamina, 2026) | AI untuk kapan dan di mana melaut | Dipakai sebelum melaut, sedangkan NELAYANKU sesudah mendarat. Bisa jadi pelengkap. |

Dari penelusuran terbatas, belum ditemukan aplikasi yang menggabungkan grading foto berbasis SNI, rentang harga wajar, pesanan H-1, bagi hasil transparan, dan kanal olahan untuk nelayan kecil. **USP yang dijual di proposal adalah kombinasi ini, bukan "AI deteksi kesegaran".**

Konteks: kasus eFishery (pendirinya divonis 9 tahun pada April 2026 karena menggelembungkan pendapatan) membuat "angka yang bisa diaudit" jadi nilai jual. Hash audit dan label sumber pada setiap angka menjawab kekhawatiran itu.

## 7. UX untuk juri (penilaian asinkron)

- **"Coba tanpa login"** dengan 6 foto contoh. Hasil skor keluar dalam beberapa detik.
- **"Masuk sebagai: Operator KUB / Nelayan / Pembeli / UMKM"** dengan satu klik, plus tombol **reset demo**.
- **Data seed Bengkulu** berlabel "simulasi": KUB fiktif di Kampung Sumber Jaya, harga acuan 30 hari, pesanan yang sedang berjalan.
- Unggah drag-and-drop yang besar untuk desktop.
- **Model di browser** jadi tidak bergantung pada server AI. **Keep-alive** Supabase (pause setelah 7 hari) dan endpoint AI (HF Spaces tidur setelah 48 jam), dari 20 sampai 30 Nov. **Uji ulang semua akun pada 27 Nov.**
- **Video 3–5 menit, satu cerita:** masalah (angka Pulau Baai), lalu satu hari di dermaga, lalu Studio, lalu siapa yang membayar.
- Di halaman depan, **bisnis dan dampak muncul sebelum AI**. Tujuannya supaya juri tidak menilai ini sebagai "proyek YOLO lagi".

## 8. Rekomendasi teknis singkat

- **Model:** klasifikasi potongan mata (3 kelas) dan insang (2 kelas) memakai YOLO11n-cls atau MobileNetV3, diekspor ke ONNX lalu dikuantisasi, dan dijalankan dengan onnxruntime-web. Data: FFE (Mendeley, CC BY 4.0) + Roboflow (CC BY 4.0) + foto sendiri. Split data per individu ikan.
- **Rumus skor dan harga** ditulis sebagai fungsi murni dengan tes unit. Inilah bagian yang paling mungkin dibaca juri kode.
- **LLM hanya di Studio**, dengan keluaran JSON tervalidasi, validator aturan label, cache, dan fallback template.
- **Supabase RLS di semua tabel.** Buku kas hanya bisa dilihat nelayan bersangkutan dan operator KUB-nya.

## 9. Estimasi skor

Perkiraan ini didasarkan pada rubrik, bukan jaminan. Hasil akhir juga bergantung pada karya tim lain.

| Kriteria | Bobot | Ide awal: juri biasa | Ide awal: juri skeptis | Tahan banting: juri biasa | Tahan banting: juri skeptis |
| :-- | --: | --: | --: | --: | --: |
| Fungsionalitas & Kualitas Teknis | 25% | 75 | 60 | 88 | 82 |
| Inovasi & Ketepatan Solusi | 20% | 72 | 55 | 86 | 80 |
| Relevansi Tema & Dampak | 15% | 88 | 75 | 90 | 85 |
| UI/UX | 15% | 72 | 60 | 88 | 82 |
| Kualitas Source Code | 15% | 82 | 70 | 87 | 82 |
| Dokumentasi | 10% | 85 | 70 | 90 | 85 |
| **Total tertimbang** | | **±78** | **±64** | **±88** | **±82** |
| **Rata-rata 3 juri (2 biasa + 1 skeptis)** | | | **±73** | | **±86** |

**Pelajarannya:** versi tahan banting tidak hanya menaikkan skor rata-rata. Yang lebih penting, jarak antara juri biasa dan juri skeptis menyempit dari 14 poin menjadi 6 poin. Itulah yang menjaga skor rata-rata tetap tinggi.

## 10. Rencana kerja

Rencana harian dan pembagian tugas ada di `PRD.md` §15. Urutan prioritasnya:
1. **5–8 Nov:** alur dermaga (pendaratan → grading → harga) jalan offline dengan model sungguhan.
2. **9–11 Nov:** pesanan → batch → QR → terima → bagi hasil → buku kas.
3. **12–14 Nov:** Studio UMKM, mode juri, dashboard dampak.
4. **Sepanjang 6–15 Nov:** wawancara validasi, berjalan paralel.
5. **15–20 Nov:** QA, keep-alive, video, proposal, kumpulkan sebelum siang.

## 11. Angka siap pakai untuk proposal dan video

Semua angka ada di `RISET.md`, lengkap dengan tanda [V]/[S] dan tautan sumber. Angka yang paling kuat untuk dibuka di proposal dan video:

1. **Tongkol Rp13.000/kg di TPI Pulau Baai, Rp30.000/kg di pengecer.** Bagian nelayan hanya ±43%. (Agribis UMB, Jul 2026)
2. **90% nelayan Kota Bani menjual ke toke**, dan **85% tidak punya cool box**. (Mujagri, 2023)
3. **77,42% nelayan Seluma berutang**, dengan pendapatan ±Rp1,35 juta/bulan. (Agribis Unived, Jan 2026)
4. **61% pekerja pascapanen perikanan adalah perempuan.** (Mongabay/KemenPPPA)
5. **Kampung Nelayan Merah Putih:** target 1.100 desa dengan cold storage, pabrik es, dan balai lelang. NELAYANKU bisa menjadi lapisan digitalnya. (Kompas, Mei 2025)
