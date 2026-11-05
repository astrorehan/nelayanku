# Model Bisnis & Sisi Pembeli — NELAYANKU

Dokumen ini menjawab jebakan terbesar proyek seperti ini: **aplikasinya jalan, tapi tidak ada yang membeli dan tidak ada yang membayar.** Isinya mengikuti BAB II template proposal (2.2 USP, 2.3 Target Market, 2.4 Potensi Pengembangan dan Monetisasi).

Tanda: **[V]** fakta yang sudah dicek (sumber di `RISET.md`) · **[A]** asumsi yang wajib divalidasi.

---

## 0. Ringkasan bisnis

- **Siapa yang membayar:** (1) KUB, koperasi, atau KDMP lewat langganan Pro; (2) pembeli swasta (restoran, hotel, katering) lewat biaya layanan 2% yang sudah termasuk dalam harga; (3) program pemerintah atau CSR (Dinas KP, Kampung Nelayan Merah Putih, BUMN) lewat kontrak implementasi. **Nelayan dan UMKM gratis.**
- **Pembeli jangkar:** **dapur SPPG (program MBG)** memberi volume harian yang stabil, dan aturannya mewajibkan pemasok lokal. **Restoran, hotel, dan katering** menjadi kanal margin untuk grade A.
- **Kenapa pembeli mau:** harga di bawah pasar (tongkol Rp17–20 ribu/kg vs eceran Rp30 ribu), bukti mutu per batch, dan satu pemasok berbadan hukum yang mewakili banyak nelayan.
- **Kenapa nelayan mau:** dibayar minimal setara harga TPI (+22% kalau pembeli membayar Rp20 ribu/kg), catatan pembayaran dan utang terbuka, dan riwayat transaksi yang bisa dipakai untuk mengajukan kredit.
- **Yang sengaja tidak dilakukan:** menjual ke konsumen umum, meminjamkan uang, dan memiliki gudang atau armada sendiri.
- **Uji paling menentukan:** H1, yaitu apakah pembeli institusi mau membayar ≥Rp17.000/kg (bagian 8).

## 1. Jebakan konsumen dan bisnis dari startup nyata, beserta penangkalnya

| Jebakan | Bukti nyata | Penangkal di NELAYANKU |
| :-- | :-- | :-- |
| **Menjual ke konsumen umum (B2C)** | TaniHub menutup layanan B2C pada Maret 2022. Menurut manajemen, volume B2C "sangat kecil" dan bisnis utamanya B2B [V]. Sayurbox pindah ke B2B setelah pertumbuhan B2C melemah (Apr 2023) [V]. | Hanya melayani pembeli institusi. Produk olahan dijual lewat kanal yang sudah ada (toko oleh-oleh, marketplace), tanpa membangun toko sendiri. |
| **Menjalankan pinjaman** | Pemberi dana TaniFund berhenti menerima pengembalian sejak sekitar Nov 2022, lalu OJK menjatuhkan sanksi (Mar 2023) [V] | NELAYANKU tidak pernah meminjamkan uang. Buku kas hanya mencatat. Pembiayaan disalurkan lembaga resmi (KUR, kredit program, KDMP). |
| **Angka yang tidak bisa diaudit** | eFishery memalsukan pendapatan sekitar US$600 juta (9 bulan sampai Sep 2024), dan pendirinya divonis 9 tahun (29 Apr 2026) [V] | Hash audit per grading dan per batch, label sumber pada setiap angka, rumus terbuka, data demo berlabel simulasi |
| **Bakar uang sambil menunggu pendanaan** | Aruna memangkas staf (Des 2024–Jan 2025). Pendorongnya kondisi sektor yang sulit, minat investor yang melemah, dan putaran US$60 juta yang batal pada 2023 [V]. | Tanpa gudang dan armada. Pendapatan awal dari kontrak program. Infrastruktur gratis atau murah. |
| **Gudang dan logistik sendiri** | TaniHub menutup gudang Bandung dan Bali serta layanan antar di hari yang sama (2022) [V]. Sayurbox menutup 2 mini-hub (Jan 2023) [V]. | KUB mengantar dengan sarana yang sudah ada, cold storage memakai fasilitas KNMP, dan platform hanya mengatur jadwal serta bukti |
| **Sulit menambah pengguna** | Sebuah skripsi IPB (2024) menyebut FishLog kesulitan menambah pengguna [S] | Mulai dari alat yang berguna tanpa pembeli. Masuk lewat KUB atau KDMP, sehingga satu pintu langsung menjangkau puluhan nelayan. Ada pendamping digital. |
| **Piutang pembeli (bayar tempo)** | Skripsi UGM tentang pemasok seafood Seacart menyebut piutang sebagai masalah modal kerja [S] | Pesanan H-1 dengan DP. Termin bayar ditanyakan saat validasi. Modal kerja KUB berasal dari fasilitas resmi (KDMP, KUR), bukan dari platform. |
| **Komisi dalam pengadaan MBG** | Peraturan BGN 10/2026 melarang mark-up dan komisi dalam pengadaan SPPG [S] | Kanal SPPG tidak dikenai komisi per transaksi. Pendapatannya dari langganan KUB. |

## 2. Siapa pembelinya (target market)

### 2.1 Dapur SPPG (program MBG): pembeli jangkar untuk volume

**Fakta:**
- Ada **27.022 SPPG aktif** secara nasional (Kepala BGN di DPR, 3 Sep 2026) [V].
- Di Bengkulu, MBG menjangkau **348.071 penerima manfaat** dengan realisasi Rp247,36 miliar per Juni 2026 [V]. Kota Bengkulu saja punya sekitar 30 SPPG (Feb 2026) [S].
- Anggaran bahan baku **Rp8.000–10.000 per porsi** [S].
- **Peraturan BGN 10/2026** (berlaku 18 Agu 2026) [S, dari ringkasan sekunder; teks resmi dicek di jdih.bgn.go.id]:
  - SPPG wajib melibatkan pelaku usaha lokal (UMK, koperasi, KDMP, BUMDes) sebagai pemasok, mulai dari kecamatannya sendiri.
  - Hasil perikanan dan kelautan termasuk produk dalam negeri yang diprioritaskan.
  - Mark-up dan komisi dilarang.
  - Pemasok wajib punya NIB dan NPWP, sarana yang higienis, mutu yang terjaga, dan pasokan yang berkelanjutan.
- SPPG tidak boleh hanya dipasok satu pemasok (Republika, Feb 2026) [S].
- BGN menyiapkan sistem pemantau pembelian antara SPPG dan pemasok untuk mencegah kongkalikong (Jul 2026) [V].
- KKP sudah memfasilitasi business matching antara KNMP Poncosari (Bantul) dan sekitar 40 SPPG, dengan potensi transaksi Rp1,84 miliar (Mei 2026). Sejauh ini yang ditawarkan adalah ikan budidaya (udang, nila, lele) [V].
- Menurut BGN, ada 5.482 korban keracunan dalam 71 insiden sejak 22 Jul 2026, dan lebih dari 80% disebabkan pelanggaran SOP [V]. Keamanan pangan sedang menjadi sorotan.

**Akibatnya untuk NELAYANKU:**
- Pemasoknya harus berbadan hukum. Jadi NELAYANKU melayani **KUB berbadan hukum, koperasi, atau KDMP**, bukan nelayan perorangan.
- Tidak boleh ada komisi, jadi pendapatan dari kanal ini berasal dari **langganan KUB**.
- Harganya harus efisien. Tongkol Rp20.000/kg berarti sekitar **Rp1.200 per porsi 60 g** [A], masih cocok dengan anggaran bahan baku Rp8.000–10.000 per porsi.
- **Bukti mutu dan ketertelusuran per batch** membantu SPPG memenuhi pemeriksaan bahan baku dan sistem pemantauan BGN. Ini nilai jual utamanya.
- **Celah pasar:** ikan tangkap laut belum banyak masuk ke SPPG. Yang dipromosikan KKP sejauh ini ikan budidaya.
- **Kehati-hatian:** tongkol, cakalang, dan tuna bisa membentuk histamin kalau tidak segera didinginkan. Menurut FDA, pendinginan cepat sesaat setelah ikan mati adalah kontrol terpenting [S]. **Skor organoleptik tidak mengukur histamin.** Karena itu, untuk jenis ikan ini status es dan batas jam sejak didaratkan wajib dicatat, dan batch tanpa es tidak boleh dikirim ke SPPG (PRD F-13, F-34).

### 2.2 Restoran, hotel, dan katering: kanal margin

- Survei tentang kebutuhan pembeli jenis ini di Indonesia **belum ditemukan**, jadi wajib divalidasi (H1–H3).
- Nilai yang ditawarkan: ikan grade A, pasokan yang konsisten, dan bukti mutu.
- Pendapatan dari biaya layanan 2% boleh dipakai karena ini pembeli swasta.
- Yang perlu diwaspadai adalah termin bayar (tempo). Jawabannya: pesanan dengan DP, dan termin ditanyakan saat validasi.

### 2.3 Toko oleh-oleh dan marketplace: kanal produk olahan

- Contoh jaringan yang sudah ada: Gusti Kalamansi (dibina CSR Pertamina) menjual produk dari 65 UMKM Bengkulu [V].
- Studio membuat aset (label, HPP, caption) untuk kanal yang sudah ada, tanpa membangun marketplace sendiri.

## 3. Mitra (bukan pembeli, tapi penentu)

| Mitra | Fakta | Peran |
| :-- | :-- | :-- |
| **Koperasi Desa/Kelurahan Merah Putih (KDMP)** | 10.070 unit sudah beroperasi (15 Okt 2026), target 35.000 di akhir 2026 [V]. BGN menyebut pelibatannya sebagai pemasok MBG "wajib" [V]. Bisa mendapat pinjaman maksimal Rp3 miliar dengan bunga 6% dan tenor 72 bulan (PMK 49/2025) [S]. | Badan hukum pemasok SPPG, sumber modal kerja KUB, dan pelanggan langganan |
| **Kampung Nelayan Merah Putih (KNMP)** | 65 lokasi tahap I selesai dibangun akhir Apr 2026. **Dua di Bengkulu: Merpas (Nasal, Kaur) dan Penago I (Ilir Talo, Seluma)** [V]. Target 1.386 lokasi di akhir 2026 [S]. Dikelola KDMP, dengan peran sebagai penampung hasil tangkapan [S]. | Lokasi pilot, karena cold storage, pabrik es, dan balai lelang sudah ada |
| **Dinas KP dan CSR** | Pertamina sudah membina 65 UMKM Bengkulu lewat Gusti Kalamansi [V] | Pendanaan program, pelatihan, dan pendamping digital |

**Rekomendasi lokasi pilot:** **KNMP Penago I, Seluma**. Kabupaten Seluma adalah tempat 77,42% nelayan dalam survei berutang [V]. Fasilitas fisiknya sudah dibangun pemerintah, dan KDMP bisa menjadi pemasok resmi untuk SPPG di kecamatan setempat. Pilihan kedua: PPN Pulau Baai (Kota Bengkulu), untuk kanal restoran dan hotel.

## 4. Satu angka yang menentukan: harga impas

Semua bisnis ini bergantung pada satu pertanyaan: **berapa yang mau dibayar pembeli institusi untuk ikan grade A yang diantar dan terbukti mutunya?**

Rumus yang diterima nelayan per kg:

```
Diterima nelayan = P − e − (k + f + c) × P
P = harga dibayar pembeli     e = es & angkut (Rp1.500/kg) [A]
k = kas KUB (8%) [A]          f = biaya layanan NELAYANKU (2%) [A]
c = cadangan susut/tolak (3%) [A]
→ Diterima nelayan = 0,87 × P − 1.500
```

Supaya nelayan menerima **minimal harga TPI hari ini (Rp13.000/kg untuk tongkol di Pulau Baai [V])**, pembeli harus membayar:

> **P ≥ Rp16.700/kg.** Ini masih jauh di bawah harga pengecer Rp30.000/kg [V].

**Tabel sensitivitas (tongkol grade A):**

| Harga dibayar pembeli | Diterima nelayan | Dibanding TPI (Rp13.000) | Kas KUB | Biaya layanan platform |
| --: | --: | --: | --: | --: |
| Rp17.000 | Rp13.290 | +2% | Rp1.360 | Rp340 |
| Rp20.000 | Rp15.900 | +22% | Rp1.600 | Rp400 |
| Rp24.000 | Rp19.380 | +49% | Rp1.920 | Rp480 |

**Contoh satu batch 40 kg pada P = Rp20.000:** nelayan menerima total Rp116.000 lebih banyak daripada kalau menjual di TPI, kas KUB bertambah Rp64.000, dan platform mendapat Rp16.000.

**Pelajarannya:**
1. Bisnis ini hidup kalau **H1 benar**: pembeli institusi di Kota Bengkulu mau membayar ≥Rp17.000/kg untuk tongkol grade A yang diantar. Ini hipotesis pertama yang divalidasi (bagian 8).
2. **Biaya layanan per kg kecil.** Dengan 5% pendaratan PPN Pulau Baai (±311 ton/tahun dari 6.214 ton [V]) dan Rp400/kg, pendapatannya ±Rp124 juta/tahun. Jadi satu pelabuhan tidak cukup. Bisnisnya hidup dari **banyak KUB** ditambah **kontrak program** (bagian 5).
3. **Untuk kanal SPPG, biaya layanan bernilai nol**, karena Peraturan BGN 10/2026 melarang komisi. Rumusnya menjadi 0,89 × P − 1.500, sehingga impasnya turun ke **P ≥ Rp16.300/kg**. Pendapatan NELAYANKU dari kanal ini berasal dari langganan KUB.

## 5. Model pendapatan

Disusun sesuai pertanyaan template proposal 2.4 (B2C/B2B, freemium, langganan, kemitraan).

| Aliran | Siapa membayar | Bentuk | Kenapa mau membayar |
| :-- | :-- | :-- | :-- |
| **Gratis selamanya** | — | Nelayan dan UMKM tidak pernah membayar | Mereka pihak yang diberdayakan. Penghalang adopsi harus nol. |
| **Biaya layanan transaksi (B2B)** | Pembeli swasta (restoran, hotel, katering), sudah termasuk dalam harga. **Tidak berlaku untuk SPPG.** | 2% dari nilai batch [A] | Mutu terbukti, asal ikan jelas, satu faktur untuk banyak nelayan, harga di bawah eceran |
| **Langganan KUB (freemium, B2B)** | KUB, koperasi, atau KDMP. **Kanal SPPG memakai jalur ini.** | Gratis: pendaratan, grading, buku kas. **Pro** (±Rp99.000/bulan [A]): pesanan institusi, faktur, dokumen mutu pemasok SPPG, dashboard dampak, ekspor data | Dibayar dari kas KUB yang bertambah (contoh: Rp1.600/kg × volume) |
| **Kontrak program (B2G/CSR)** | Dinas KP, program Kampung Nelayan Merah Putih, CSR BUMN | Paket implementasi per desa: lisensi, pelatihan, pendamping digital | Program butuh alat ukur dampak (kg, rupiah, nelayan aktif). Dashboard F-70/F-71 menyediakannya. |
| **Kemitraan pembiayaan** | Lembaga pembiayaan | Rujukan pengajuan kredit dengan riwayat transaksi (izin nelayan) [A] | Data transaksi yang bisa diaudit menurunkan risiko kredit |
| **Kemitraan Studio** | Pemasok kemasan, percetakan label | Komisi rujukan [A] | Akses ke banyak UMKM pengolah ikan |

**Urutan realistis:** tahun 1 hidup dari kontrak program dan CSR (pilot), tahun 2 dari biaya layanan dan langganan Pro saat KUB bertambah.

### 5.1 Pembiayaan nelayan: menyediakan data, bukan meminjamkan uang

**Fakta:**
- **KUR 2026** berbunga 6%. Realisasinya Rp169 triliun untuk 2,65 juta debitur sampai 22 Jul 2026 [V]. Porsi perikanan hanya sekitar 1,55% dari total KUR (sampai 30 Sep 2026) [S].
- **Kredit program KKP** di kuartal I 2026: Rp2,23 triliun untuk 131.230 debitur, 34,88% di antaranya untuk penangkapan [V].
- **Pinjaman KDMP:** maksimal Rp3 miliar, bunga 6%, tenor 72 bulan (PMK 49/2025) [S].
- Bank ragu memberi kredit ke nelayan karena **arus kasnya tidak stabil dan tidak ada agunan** [S, BRIN].
- Preseden: Aruna membagikan data transaksi platform ke lembaga keuangan mitra untuk credit scoring (2021) [V].

**Desain NELAYANKU:**
- **Buku kas dan riwayat transaksi** (dengan izin nelayan) menjadi bukti arus kas untuk pengajuan KUR atau kredit program. Ini menjawab langsung alasan bank menolak.
- **Modal kerja KUB**, yaitu dana untuk membayar nelayan hari itu sebelum SPPG atau restoran membayar, berasal dari fasilitas resmi seperti pinjaman KDMP atau KUR.
- **Platform tidak pernah menyalurkan dana.** Pelajaran dari TaniFund: menjalankan pinjaman adalah bisnis lain dengan risiko lain.

## 6. Ukuran pasar

| Lapisan | Angka | Tanda |
| :-- | :-- | :-- |
| **Nasional (TAM)** | 2.773.538 nelayan. >80% produksi tangkap dari nelayan kecil. 92,7% kapal adalah kapal kecil. 438 TPI aktif. | V |
| **Bengkulu (SAM)** | Produksi tongkol 7.275,1 ton (2023) se-provinsi. Dengan harga TPI Rp13.000/kg, nilainya ±Rp94,6 miliar/tahun untuk tongkol saja. | V (produksi, harga) · hitungan |
| **Pilot Pulau Baai (SOM, 3 tahun)** | 5% dari 6.214 ton pendaratan PPN Pulau Baai = ±311 ton/tahun. Kampung Sumber Jaya punya 799 KK. Kota Bengkulu punya 2.843 nelayan aktif. | V (angka dasar) · A (5%) |

## 7. Go-to-market: memulai tanpa jebakan "ayam dan telur"

Marketplace dua sisi biasanya mati karena penjual menunggu pembeli dan pembeli menunggu penjual. NELAYANKU memulai dari sisi yang **sudah berguna meski belum ada pembeli**.

| Tahap | Apa yang terjadi | Kenapa berhasil |
| :-- | :-- | :-- |
| 1. Alat gratis untuk KUB | Pendaratan, grading, dan buku kas dipakai sehari-hari | Bermanfaat tanpa pembeli: catatan transparan, pembagian adil, bukti mutu |
| 2. Satu sampai tiga pembeli jangkar | Pesanan rutin dari dapur SPPG, restoran, atau katering di Kota Bengkulu | Permintaan harian yang stabil. KUB tidak menunggu pasar. |
| 3. Studio UMKM | Ikan grade C jadi produk olahan, dijual lewat toko oleh-oleh (misalnya jaringan seperti Gusti Kalamansi dengan 65 UMKM [V]) dan marketplace | Pendapatan tambahan untuk perempuan pesisir, tanpa bergantung pembeli institusi |
| 4. Replikasi | Desa Kampung Nelayan Merah Putih yang sudah punya cold storage, pabrik es, dan balai lelang [V] | Infrastruktur fisik sudah dibangun pemerintah, NELAYANKU jadi lapisan digitalnya |

**Pendamping digital:** mahasiswa (misalnya lewat KKN atau magang Universitas Bengkulu) menemani operator KUB di minggu-minggu pertama. Ini menjawab keterbatasan literasi digital tanpa memaksa nelayan belajar sendiri.

**Tempat pilot:** **KNMP Penago I (Seluma)** untuk kanal SPPG lewat KDMP, dan **PPN Pulau Baai (Kota Bengkulu)** untuk kanal restoran, karena TPI-nya berjalan dan rantai harganya sudah terdokumentasi (Rp13.000 vs Rp30.000). Lihat bagian 3.

## 8. Rencana validasi (selama 16 hari pengembangan)

Bukti dari calon pengguna nyata adalah pembeda terbesar di bagian "Ketepatan Solusi" dan "Dampak". Target minimal: **5 pembeli, 3 nelayan/pengepul, 2 pengolah, 1 dosen perikanan.**

### 8.1 Hipotesis, diurutkan dari yang paling menentukan

| Kode | Hipotesis | Lulus kalau | Cara uji |
| :-- | :-- | :-- | :-- |
| **H1** | Pembeli institusi mau membayar ≥Rp17.000/kg untuk tongkol grade A yang diantar | ≥3 dari 5 pembeli saat ini membayar ≥Rp17.000/kg atau mau membayar segitu | Telepon/WA ke rumah makan seafood, katering, dapur SPPG di Kota Bengkulu |
| **H2** | Pembeli mau memesan H-1 dengan kirim pagi | ≥3 dari 5 bilang "ya" atau sudah melakukannya dengan pemasok sekarang | idem |
| **H3** | Bukti mutu dan asal ikan membuat pembeli lebih percaya atau mau membayar lebih | ≥3 dari 5 menyebut mutu/kesegaran sebagai masalah | idem |
| **H4** | Operator/KUB mau mencatat ≤1 menit per kapal | Uji prototipe dengan 1–2 orang | Kunjungan atau video call |
| **H5** | Nelayan mau utangnya dicatat terbuka | ≥2 dari 3 nelayan setuju | Wawancara nelayan/pengepul |
| **H6** | Label, HPP, dan caption dianggap berguna oleh pengolah | 2 dari 2 pengolah mau mencoba | Wawancara pengolah |
| **H7** | Ambang grade (§10.2 PRD) masuk akal | Dosen perikanan setuju atau memberi koreksi | Konsultasi dosen perikanan |
| **H8** | SPPG mau menerima ikan tangkap laut dari KUB atau KDMP yang membawa bukti mutu per batch | ≥1 SPPG atau pengelola KNMP/KDMP bilang mau, atau sudah melakukannya | Kunjungan ke KNMP Poncosari, telepon SPPG di Kota Bengkulu |

**Lokasi yang terjangkau dari Yogyakarta:**
- **KNMP Poncosari (Bantul)**, yang sudah business matching dengan sekitar 40 SPPG. Cocok untuk mewawancarai pengelola KNMP/KDMP dan SPPG.
- TPI Pantai Depok (Bantul) dan PPP Sadeng (Gunungkidul), untuk nelayan dan pengolah.
- Departemen Perikanan UGM, untuk konsultasi ambang grade. Untuk pembeli Bengkulu, cari "rumah makan seafood Kota Bengkulu" dan "katering Kota Bengkulu" di Google Maps, lalu hubungi lewat WA atau telepon.

### 8.2 Naskah wawancara pembeli (±7 menit)

Mulai dengan perkenalan: mahasiswa yang sedang merancang aplikasi untuk lomba, minta izin mencatat jawaban, nama tidak akan dicantumkan tanpa izin.

1. Ikan apa saja yang Bapak/Ibu beli setiap minggu, dan berapa kilogram?
2. Biasanya beli di mana (pasar, pemasok langganan, TPI, pengepul)? Kenapa di sana?
3. Berapa harga per kg tongkol (atau ikan yang paling sering dibeli) bulan ini? Sudah termasuk antar?
4. Pernah dapat ikan yang kurang segar? Seberapa sering? Apa yang dilakukan kalau itu terjadi?
5. Bagaimana Bapak/Ibu memastikan ikannya segar saat diterima?
6. Kalau ada pemasok yang memberi bukti mutu per kiriman (skor kesegaran dan jam ikan didaratkan), apakah itu berpengaruh? Kenapa?
7. Apakah memesan sehari sebelumnya dengan kirim pagi cocok untuk dapur Bapak/Ibu?
8. Biasanya bayar pemasok kapan: tunai, transfer langsung, atau tempo berapa hari?
9. Berapa harga per kg yang masih masuk akal untuk tongkol segar terjamin yang diantar sampai dapur?
10. Boleh kami hubungi lagi saat prototipenya jadi?

**Tambahan khusus SPPG:**
- Siapa yang memutuskan pemasok, dan dokumen apa yang diminta dari pemasok ikan?
- Seberapa sering ikan masuk menu, dan ikan apa saja?
- Apa yang membuat dapur ragu menyajikan ikan laut?
- Pemasok biasanya dibayar berapa hari setelah barang diterima?

### 8.3 Naskah wawancara nelayan / pengepul (±7 menit)

1. Setelah mendarat, ikan biasanya dijual ke siapa dan berapa lama sampai laku?
2. Siapa yang menentukan harganya? Bagaimana caranya?
3. Apakah Bapak pernah meminjam modal (BBM, es, alat) dari pembeli ikan? Bagaimana cara melunasinya?
4. Kalau ada pembeli yang memesan sehari sebelumnya dengan harga lebih tinggi untuk ikan yang segar, apa yang membuat Bapak mau atau tidak mau ikut?
5. Bagaimana kalau catatan utang dan pembayaran ditulis terbuka dan bisa Bapak lihat sendiri?
6. HP apa yang dipakai sehari-hari, dan untuk apa saja?

### 8.4 Naskah wawancara pengolah (±5 menit)

1. Produk apa yang dibuat, dan dari ikan apa?
2. Dari mana bahan bakunya, dan berapa harganya?
3. Bagaimana menghitung harga jual?
4. Sudah punya P-IRT atau label? Apa yang paling sulit?
5. Jualnya lewat mana (warung, toko oleh-oleh, WA, marketplace)?

### 8.5 Log bukti (diisi setiap selesai wawancara)

| Tanggal | Peran (bukan nama) | Lokasi | Kutipan penting | Hipotesis | Lulus/Gagal | Dampak ke desain |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| | | | | | | |

Kutipan yang sudah diizinkan dipakai di proposal dan video. **Kalau H1 gagal**, ubah pembeli jangkar (misalnya dari restoran ke dapur SPPG atau katering) atau ubah jenis ikan, lalu hitung ulang tabel di bagian 4. Kegagalan ini justru bahan yang kuat untuk proposal, karena menunjukkan tim menguji idenya.

## 9. Metrik keberhasilan

| Metrik | Definisi |
| :-- | :-- |
| **North Star** | **Rupiah tambahan yang diterima nelayan dibanding harga TPI**, per bulan |
| Volume | Kg terjual lewat batch per minggu |
| Keandalan | % batch terkirim tepat waktu · % penerimaan tanpa sengketa |
| Retensi pembeli | % pembeli yang memesan lagi dalam 30 hari |
| Pangan terselamatkan | Kg grade C yang terolah |
| Adopsi | Nelayan aktif mingguan · rata-rata waktu catat per kapal |

## 10. Nama

- Dari pencarian web, **belum ditemukan aplikasi atau startup bernama "Nelayanku" atau "NelayanKu"** [S]. Yang mirip: NelayanKita (makalah jurnal), E-Nelayan Dompu, dan Nelpin (KKP). "Desa Niaga" dan "SegarLaut" juga tidak ditemukan. Nama yang mirip SegarLaut: Ikan Segar (PT Ikan Segar Indonesia), SEGARA (aplikasi mahasiswa UNY), dan Mamarikan.
- **Belum dicek:** Play Store dan PDKI (pangkalan data merek DJKI). Cek manual sebelum mengunci nama.
- **Rekomendasi:** pakai **NELAYANKU** untuk lomba. Namanya mudah diingat dan langsung menunjukkan siapa yang dibela.
