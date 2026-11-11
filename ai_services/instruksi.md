# Instruksi dan tracker AI Services Nelayanku

Dokumen ini memecah [PLAN.md](PLAN.md) menjadi pekerjaan yang dapat dilanjutkan satu per satu di branch `feat/ai-services`. Acuan frontend adalah `feat/frontend-ui` commit `836f54c`. Tanggal penyusunan 11 November 2026 WIB.

Gunakan kode `AI-xx-yy` sebagai rujukan tugas dalam percakapan, commit, dan laporan. `xx` menunjukkan kelompok tahap dan `yy` menunjukkan urutan tugas. Contoh permintaan kerja adalah `Kerjakan AI-10-01 sesuai instruksi.md`.

## Cara memakai tracker

- `TODO` berarti pekerjaan belum dimulai, `DOING` berarti sedang dikerjakan, `BLOCKED` berarti ada hambatan yang dicatat, dan `DONE` berarti bukti selesai sudah diperiksa.
- Sebelum bekerja, baca kembali PLAN.md, branch aktif, perubahan lokal, dan dependensi kode tugas. Ubah satu tugas yang mulai dikerjakan menjadi `DOING`. Pekerjaan persiapan yang independen dapat berjalan bersamaan.
- Saat selesai, isi catatan bukti dengan lokasi artefak, perintah atau langkah pemeriksaan, hasil, tanggal, dan commit bila tersedia. Setelah kriteria selesai terpenuhi, ubah status menjadi `DONE`. Jika pemeriksaan gagal, catat penyebab dan tindakan berikutnya.
- Catat keputusan tentang label, ambang, atau perubahan kontrak beserta alasannya. Jika mengubah cakupan, selaraskan PLAN.md dan dependensi tracker.
- Jalankan kode model, API, dan integrasi ketika tugas implementasinya diminta. Semua status awal di bawah menggambarkan pekerjaan implementasi yang belum diverifikasi. Folder dan nama artefak yang disebutkan adalah tujuan keluaran saat implementasi.

## Peta tahap

| Kelompok | Tahap pada PLAN.md | Hasil utama |
| --- | --- | --- |
| `AI-00` | Persiapan lintas tahap | Kontrak dan lingkungan kerja yang dapat direproduksi |
| `AI-10` | Tahap 1, data dan protokol | Dataset berlabel, split per ikan, serta set uji HP |
| `AI-20` | Tahap 2, YOLO dan ONNX | Dua classifier, laporan, manifest, dan artefak ONNX |
| `AI-30` | Tahap 3, OpenCV dan API | Pipeline gambar dan layanan FastAPI |
| `AI-40` | Tahap 4, integrasi P0 | Penilaian foto baru melalui API dan browser, termasuk offline |
| `AI-50` | Tahap 5, deteksi P2 | Model ketiga untuk menemukan mata dan insang otomatis |

## AI-00 — Persiapan kontrak dan lingkungan

| Kode | Status | Dependensi | Instruksi dan kriteria selesai |
| --- | --- | --- | --- |
| `AI-00-01` | TODO | PLAN.md | Catat kontrak crop, label dan respons pada `ai_services/contracts.md`. Tetapkan mata `very_fresh/fresh/not_fresh`, insang `fresh/not_fresh`, kunci JSON mata `veryFresh/fresh/notFresh`, dan insang `fresh/notFresh`. Catat input spesies, versi model, `ok/unassessable`, alasan abstain, error, serta batas upload. Selesai jika contoh kedua bagian dan hasil abstain cocok dengan kontrak frontend serta PLAN.md. |
| `AI-00-02` | TODO | `AI-00-01` | Siapkan lingkungan Python, dependensi terkunci, konfigurasi CPU/GPU, seed, direktori data yang diabaikan Git, dan fixture gambar berizin. Pisahkan dependensi pelatihan dari runtime layanan bila perlu. Catat prosedur instalasi dalam README layanan. Selesai jika lingkungan baru dapat diinstal dan fixture memuat foto valid, orientasi EXIF, crop tidak simetris, buram, gelap, silau, dan salah bagian. |

Periksa isi lokal sebelum mengisi `train.py`. Gunakan `data/raw/` dan `data/interim/` sesuai PLAN.md. Simpan metadata dan konfigurasi dalam Git, lalu simpan dataset dan bobot di lokasi artefak yang dicatat. Saat memindahkan data dari `raw_dataset/`, pertahankan sumber dan identitasnya.

## AI-10 — Dataset dan protokol

| Kode | Status | Dependensi | Instruksi dan kriteria selesai |
| --- | --- | --- | --- |
| `AI-10-01` | TODO | `AI-00-01` | Audit FFE v1 dan versi HansLab yang benar-benar diunduh. Buat manifest metadata dengan sumber/versi, lisensi, ID foto asli, hash berkas, `fish_id`, sesi/lot, spesies, bagian, label, dan asal augmentasi. Bedakan metadata diketahui dan belum diketahui. Selesai jika jumlah per kelas/spesies dan kelayakan pemetaan label dicatat, termasuk pemakaian dua kelas insang HansLab dan tiga kelas mata FFE. |
| `AI-10-02` | TODO | `AI-10-01` | Susun protokol foto lokal dan label bersama penilai perikanan. Mulai dari kembung, tongkol dan cakalang. Ambil mata dan insang dari ikan yang sama dengan satu ID, catat waktu serta kondisi penyimpanan, dan label setiap bagian berdasarkan protokol. Kumpulkan juga foto salah bagian/tanpa objek untuk menguji abstain. Selesai jika protokol, identitas penilai, catatan pengambilan dan distribusi sampel tersedia. |
| `AI-10-03` | TODO | `AI-10-01`, `AI-10-02` | Cari duplikat/turunan augmentasi, lalu buat split awal 70/15/15 per ikan dan kelompok pengambilan yang saling berkaitan. Letakkan semua bagian dan waktu foto ikan yang sama pada satu split. Kunci set uji HP lokal yang terpisah. Data dengan asal kelompok yang belum dapat dipastikan hanya dipakai untuk eksplorasi pelatihan. Selesai jika daftar split dan pemeriksaan kebocoran tersedia serta dataset klasifikasi terbentuk per bagian dan kelas. |
| `AI-10-04` | TODO | `AI-10-03` | Sepakati kriteria rilis sebelum membuka hasil test. Catat minimum sampel, macro-F1, precision/recall per kelas/spesies, batas salah-segar, serta cakupan hasil yang dapat dinilai. Tetapkan kebijakan untuk kombinasi spesies/bagian dengan data kurang. Selesai jika nilai ambang dan persetujuan tim produk/perikanan tercatat dengan tanggal. |

Struktur data hasil persiapan mengikuti `data/interim/eye/train/<kelas>`, `eye/val/<kelas>`, `eye/test/<kelas>`, serta struktur yang sama untuk `gill`. Augmentasi diterapkan pada train setelah split. Metadata identitas tetap dipakai untuk memeriksa kebocoran walaupun loader klasifikasi memakai folder kelas.

## AI-20 — Pelatihan dua YOLO dan ekspor ONNX

| Kode | Status | Dependensi | Instruksi dan kriteria selesai |
| --- | --- | --- | --- |
| `AI-20-01` | TODO | `AI-00-02`, `AI-10-03` | Buat entry point `train.py` dengan `--part eye|gill`, dataset, seed, konfigurasi dan lokasi output yang eksplisit. Mulai dari `yolo11n-cls.pt`, ukuran 224, maksimum 50 epoch dan early stopping. Selaraskan resize/crop val dengan rencana inferensi dan batasi augmentasi agar area mata serta warna insang tetap bermakna. Selesai jika smoke run kedua bagian dapat selesai dan konfigurasi serta urutan kelas tersimpan. |
| `AI-20-02` | TODO | `AI-20-01` | Latih classifier mata tiga kelas dan insang dua kelas. Pilih `best.pt` berdasarkan validasi. Catat dataset/split, versi library, seed, transform, perangkat, log dan checkpoint setiap run. Selesai jika dua checkpoint tersedia, kelas keluaran benar, dan sumber setiap hasil dapat ditelusuri. |
| `AI-20-03` | TODO | `AI-20-02`, `AI-10-04` | Ukur kalibrasi dan pilih aturan abstain pada validation, termasuk foto salah bagian/tanpa objek. Evaluasi test terkunci satu kali setelah pilihan model dan ambang final. Laporkan confusion matrix, macro-F1, precision/recall per kelas/spesies, salah-segar dan cakupan. Selesai jika model card memuat hasil nyata dan daftar kombinasi spesies/bagian yang boleh aktif. Jika kriteria gagal, catat hasil dan jalur manualnya. Set test tetap dipisahkan dari pemilihan revisi berikutnya. |
| `AI-20-04` | TODO | `AI-20-03` | Ekspor dua model ke ONNX FP32 statis `1×3×224×224`. Buat manifest bundle dengan checksum SHA-256, versi, label berurutan, spesies aktif, nama/bentuk tensor, preprocessing, tipe output dan aturan abstain. Catat atribusi serta kewajiban distribusi model. Selesai jika artefak dan manifest cocok serta output memakai softmax tepat sekali sesuai tipe yang terverifikasi. |
| `AI-20-05` | TODO | `AI-20-04`, `AI-30-02` | Bandingkan tensor dan probabilitas pada PyTorch, ONNX Runtime CPU dan ONNX Runtime Web WASM menggunakan fixture yang sama. Tetapkan toleransi numerik, lalu periksa label, abstain dan keputusan di sekitar ambang. Ukur ukuran dan kecepatan baseline. Jika mencoba kuantisasi, laporkan perubahan metrik dan kompatibilitas sebelum memilihnya. Selesai jika laporan perbandingan dan bundle kandidat yang konsisten tersedia. |

Versi P0 memakai dua classifier untuk beberapa jenis ikan, dengan validasi per jenis. Jenis ikan dipilih operator. Catat dukungan spesies per bagian pada manifest. Nilai confidence tinggi pada satu foto harus tetap mengikuti aturan dukungan dan quality gate.

## AI-30 — OpenCV dan FastAPI

| Kode | Status | Dependensi | Instruksi dan kriteria selesai |
| --- | --- | --- | --- |
| `AI-30-01` | TODO | `AI-00-02` | Implementasikan validasi signature JPEG/PNG, batas byte dan dimensi sebelum alokasi penuh, decode OpenCV, orientasi EXIF tepat sekali, serta validasi bentuk crop. Gunakan batas upload awal 5 MiB dan sisi crop klien maksimal 1.280 px sesuai kontrak. Selesai jika fixture valid/orientasi lolos dan fixture rusak/salah format/melebihi batas menghasilkan error terstruktur. |
| `AI-30-02` | TODO | `AI-30-01`, `AI-20-01` | Buat pipeline quality gate dan tensor. Hitung luminans, silau dan varians Laplacian pada ROI grayscale 160×160, lalu BGR→RGB, resize 224×224, skala float32 [0,1], dan NCHW. Selaraskan kernel, tepi, interpolasi dan transform dengan train/val. Kalibrasi ambang kualitas menggunakan data validasi lokal. Selesai jika fixture mempunyai nilai acuan, keputusan kualitas dan tensor yang dapat dibandingkan dengan browser. |
| `AI-30-03` | TODO | `AI-30-02`, `AI-20-04` | Muat dua sesi ONNX sekali per proses, pilih model berdasarkan `part`, periksa dukungan spesies, jalankan inferensi, dan validasi probabilitas finite, rentang serta jumlahnya. Terapkan quality gate dan abstain sesuai manifest. Selesai jika kasus mata, insang, spesies belum didukung dan confidence rendah menghasilkan keluaran sesuai kontrak. |
| `AI-30-04` | TODO | `AI-30-03`, `AI-00-01` | Buat `POST /v1/freshness/predict` multipart dengan `image`, `part`, `species`; respons `ok`/`unassessable`; serta error `requestId/code/message`. Sediakan OpenAPI, `GET /healthz` dan `GET /readyz`. Selesai jika kontrak kedua bagian, probabilitas null saat abstain, validasi input, dan readiness 503 saat bundle gagal dimuat sudah diperiksa. |
| `AI-30-05` | TODO | `AI-30-04` | Siapkan image layanan dengan dependensi/artefak terkunci, worker inferensi terbatas di luar event loop, timeout, batas antrean, serta batas request pada aplikasi dan proxy. Catat jalur autentikasi, konfigurasi staging privat, log request/versi/latensi dan pelepasan foto sementara. Uji beberapa request serentak dan kegagalan model. Selesai jika smoke test staging berhasil dan laporan p50/p95 decode, preprocessing serta inferensi tersedia. |

Penyusunan kontrak dan pipeline gambar bisa dimulai saat pelatihan berjalan. Pengujian dengan model nyata menunggu manifest dan artefak. Bukti menggunakan fixture atau model sementara harus menyebutkan kondisi itu. Perhitungan grade akhir tetap mengacu ke fungsi domain frontend setelah bau dan tekstur diisi.

## AI-40 — Integrasi frontend dan offline P0

| Kode | Status | Dependensi | Instruksi dan kriteria selesai |
| --- | --- | --- | --- |
| `AI-40-01` | TODO | `AI-00-01`, `AI-20-01` | Sambungkan crop kamera/editor unggah beresolusi asli ke input adapter `FreshnessModel` untuk mata dan insang, beserta `speciesId`. Petakan overlay dengan memperhitungkan orientasi, skala dan offset `object-fit: cover`. Pertahankan buffer kualitas 160×160 terpisah. Selesai jika fixture kamera/unggah membuktikan potongan area yang dipilih benar, termasuk foto portrait/landscape. |
| `AI-40-02` | TODO | `AI-40-01`, `AI-30-04` | Sambungkan adapter API dan keadaan UI untuk dua bagian. Tangani loading, foto ulang, pergantian spesies, timeout, error, abstain dan input manual. Batalkan atau abaikan hasil request lama. Simpan sumber dan versi aktual per hasil, termasuk campuran model/manual. Selesai jika alur foto baru sampai catatan penilaian berhasil serta hasil lama gagal menimpa foto/spesies baru. |
| `AI-40-03` | TODO | `AI-40-01`, `AI-20-05` | Tambahkan runtime browser dengan preprocessing yang cocok, cache manifest/dua model/runtime WASM dan verifikasi checksum. Aktifkan bundle lengkap secara atomik. Uji hasil browser memakai fixture paritas dan tangani cache belum siap, rusak, atau update terputus dengan penilaian manual. Selesai jika reload production build tanpa sinyal tetap dapat menilai menggunakan bundle yang valid. |
| `AI-40-04` | TODO | `AI-40-02`, `AI-40-03`, `AI-30-05` | Uji `/kub/darat` dari foto, dua prediksi, bau/tekstur, skor/grade, override dengan alasan hingga simpan dan tampilkan kembali catatan. Periksa sumber, versi, audit dan aturan rantai dingin SPPG. Uji mode simulasi, manual, API gagal dan offline. Ukur total bobot ≤12 MB serta target inferensi ≤1,5 detik per crop di Android kelas menengah. Laporkan p95 hangat dan waktu unduh/inisialisasi terpisah. Selesai jika laporan P0 mengaitkan setiap hasil dengan bundle/perangkat, seluruh alur dan target rilis lolos, serta kombinasi spesies/bagian yang diaktifkan sesuai hasil evaluasi. |

Target performa berasal dari PLAN.md dan PRD. Jika target rilis belum terpenuhi, tandai pekerjaan perbaikannya sebelum menyatakan P0 siap. Persistensi offline dan sumber hasil perlu diverifikasi pada build produksi setelah cache aktif. Sinkronisasi database lintas perangkat mengikuti pekerjaan backend yang dirujuk pada catatan integrasi.

## AI-50 — Deteksi otomatis P2

Mulai tahap ini setelah P0 memenuhi kriteria rilis. Model tambahan memakai `yolo11n.pt` untuk mendeteksi lokasi `eye` dan `gill`. Kedua classifier P0 menilai crop yang dihasilkan, sehingga jumlah model menjadi tiga.

| Kode | Status | Dependensi | Instruksi dan kriteria selesai |
| --- | --- | --- | --- |
| `AI-50-01` | TODO | `AI-40-04` | Kumpulkan dan anotasi foto ikan utuh dengan kotak mata/insang yang terlihat. Sertakan variasi posisi, bagian tertutup dan beberapa ikan. Gunakan identitas ikan serta kelompok split P0 agar tidak terjadi kebocoran lintas tahap. Selesai jika pedoman anotasi, daftar foto, distribusi kotak dan pemeriksaan split tersedia. |
| `AI-50-02` | TODO | `AI-50-01` | Latih detektor `yolo11n.pt`, pilih ambang deteksi pada validasi, dan ukur recall lokasi serta IoU/mAP per bagian pada test terpisah. Catat versi dan checkpoint. Selesai jika laporan deteksi mencakup gagal menemukan objek dan ambigu beberapa ikan serta mendefinisikan fallback crop terpandu. |
| `AI-50-03` | TODO | `AI-50-02` | Hubungkan deteksi→pemetaan koordinat letterbox ke foto asli→margin→crop persegi→quality gate→dua classifier P0. Tambahkan kontrak endpoint foto utuh dengan keluaran per bagian. Uji koordinat tepi gambar, objek kecil, bagian tertutup dan target ambigu. Selesai jika crop sesuai objek dan kegagalan memberi instruksi crop terpandu. |
| `AI-50-04` | TODO | `AI-50-03` | Uji pipeline foto utuh dari HP sampai probabilitas, skor dan grade. Bandingkan hasil crop otomatis terhadap crop terpandu pada set uji yang sama, termasuk cakupan abstain dan latensi. Selesai jika laporan memenuhi kriteria kualitas P0 dan keputusan aktivasi deteksi tercatat. |

## Catatan bukti dan kelanjutan

Tambahkan satu entri berikut setiap kali status berubah. Isi placeholder dengan hasil yang benar-benar diperiksa. Tautkan artefak atau laporan besar agar tracker tetap mudah dibaca.

```text
Kode tracker = AI-10-01
Status = TODO / DOING / BLOCKED / DONE
Tanggal = YYYY-MM-DD WIB
Pelaksana = nama
Branch dan commit = branch / hash atau perubahan lokal
Artefak = lokasi manifest, model, kode, atau laporan
Pemeriksaan = perintah atau langkah yang dijalankan
Hasil = keluaran dan kaitannya dengan kriteria selesai
Hambatan dan keputusan = isi bila ada
Langkah berikutnya = kode tracker yang dapat dilanjutkan
```

Status awal seluruh tugas adalah `TODO`. Mulai dari `AI-00-01`, lalu audit sumber dataset melalui `AI-10-01`. Untuk melanjutkan pekerjaan setelah jeda, baca status dan bukti terakhir, periksa ulang keadaan repo, kemudian pilih tugas dengan seluruh dependensi yang sudah terpenuhi.
