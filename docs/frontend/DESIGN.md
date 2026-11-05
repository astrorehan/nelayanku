# Arah visual Nelayanku

## Gagasan

Pagi di dermaga. Kapal mendarat sekitar pukul 05.00, langit masih pucat di atas laut, dan peti tongkol di atas es adalah benda yang paling penting di tempat itu. Halaman memakai cahaya itu: terang, sejuk, mudah dibaca di bawah matahari.

- **Produk:** mencatat mutu tangkapan, memenuhi pesanan, dan membagi pembayaran untuk KUB nelayan kecil
- **Karakter:** terang, tegas, terus terang
- **Dunia:** langit subuh, peti es, label timbang, huruf nama kapal yang dicat di lambung
- **Momen utama:** peti tongkol keluar dari bingkai langit di hero, diapit harga TPI dan bagian nelayan
- **Penanda:** mata emas pada logo, dipakai sedikit untuk tanda kecil dan tahap yang sedang berjalan

## Token

| Nama | Nilai | Peran |
| :-- | :-- | :-- |
| Laut dalam | `#0B2545` | Teks, pita gelap, tombol gelap |
| Biru dermaga | `#1E54E4` | Tindakan utama, tautan, fokus, pilihan aktif |
| Langit | `#CFE3FF` ke `#EBF3FF` | Latar hero dan latar pilihan aktif |
| Kabut | `#F4F7FB` | Kanvas aplikasi |
| Es | `#FFFFFF` | Panel dan halaman publik |
| Emas | `#F5B731` | Mata logo, penanda kecil |

Warna kelas mutu A, B, C, dan tolak tidak berubah; warna itu hanya membawa arti kelas.

## Huruf

- **Mona Sans** (lebar 104 sampai 112 persen, tebal 640 sampai 720) untuk judul dan angka Rupiah besar. Bentuknya lebar dan berat seperti nama kapal di lambung. Nol polos, jadi angka uang tidak terbaca seperti kode.
- **Atkinson Hyperlegible Next** tetap untuk teks dan kontrol, karena keterbacaan di luar ruangan adalah kebutuhan nyata operator dan nelayan.
- **Atkinson Hyperlegible Mono** hanya untuk kode kiriman dan cap data. Jam dan jumlah memakai angka tabular biasa.

## Bentuk

- Bingkai hero dan pita gelap 32 sampai 40 px, panel 20 sampai 28 px, tombol dan tag berbentuk pil, input 14 px
- Stempel mutu tetap bersudut kecil karena ia stempel, bukan tag
- Panel putih di atas kanvas Kabut memakai garis tipis tanpa bayangan. Bayangan hanya untuk benda yang mengambang: peti, label harga, sheet, dan popover
- Pilihan aktif selalu sama: garis Biru dermaga dan latar Langit

## Susunan

- **Halaman depan:** bingkai langit dengan judul di tengah; peti dan dua label harga menembus tepi bawahnya. Lalu tiga tahap kerja yang masing-masing menampilkan potongan produk asli (slip pesanan, hasil mata, pembagian rupiah), siapa membayar, satu pita gelap untuk penjelasan AI, dan kaki halaman dengan wordmark besar yang terpotong.
- **Cara kerja:** baris meta (nama bagian, rentang waktu, tanda simulasi), judul di tengah, lalu rel waktu Rabu 19.40, Kamis 05.05, Kamis 08.00 dengan siapa yang mencatat. Rel mendatar dari 1024 px, tegak di layar lebih kecil. Momen dermaga mendapat kolom paling lebar dan foto kepala tongkol dengan lingkar fokus di mata.
- **AI menyarankan, manusia memutuskan:** mata ikan di tengah lingkar sonar. Kiri dua angka dari model (mata, insang), kanan dua angka dari manusia (bau, tekstur), di bawah kartu keputusan operator. Letak kartu menjelaskan siapa memegang apa.
- **Coba nilai di HP:** foto contoh dalam satu baris geser dengan ubin "Foto sendiri" (kamera atau galeri). Hasil menempel di tepi bawah foto. Saat kartu hasil keluar layar, pil gelap di bawah layar menunjukkan skor yang ikut berubah ketika insang, bau, atau tekstur diubah.
- **Aplikasi peran:** kanvas Kabut, sidebar putih dengan tombol Catat pendaratan dan menu pil (desktop), navigasi bawah dengan penanda pil (HP). Isi dikelompokkan dalam panel putih; baris di dalam panel tidak dibungkus kartu lagi.

## Gerak

Satu momen saat halaman depan dibuka: peti naik ke tempatnya. Selain itu gerak hanya menjawab tindakan (sheet, popover, pilihan). Reduced motion tetap dihormati.

## Rujukan

Arah ini mengambil bahasa dari kumpulan rujukan desain profesional milik tim: bingkai hero berwarna langit dengan benda yang keluar dari tepinya, judul grotesk tebal, tombol pil, panel putih di kanvas biru pucat untuk dasbor, satu pita gelap, dan wordmark besar di kaki halaman. Subjek, teks, dan susunan rujukan tidak disalin.

Pemeriksaan meliputi lint, TypeScript, unit test, dan tangkapan layar 1366 px serta 390 px. Hasil fungsional ada di `STATUS.md`.

Audit visual versi sebelumnya mengikuti [unslop oleh Damir Sokolovsky (@heydamir)](https://github.com/heydamir/unslop), CC BY 4.0.
