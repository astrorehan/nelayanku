# Instruksi dan tracker AI Services Nelayanku

Dokumen ini memecah [PLAN.md](PLAN.md) menjadi pekerjaan yang dapat dilanjutkan satu per satu di branch `feat/ai-services`. Acuan frontend adalah `feat/frontend-ui` commit `836f54c`. Tanggal penyusunan 11 November 2026 WIB.

## Batas branch dan penanggung jawab

- Perubahan dikerjakan lokal. Commit dan push hanya dilakukan setelah instruksi eksplisit pengguna; permintaan mengerjakan tahap tidak menjadi izin otomatis untuk keduanya.
- Jangan membuat branch atau worktree baru sendiri. Gunakan branch yang sudah tersedia sesuai arahan pengguna. Pekerjaan layanan saat ini tetap di `feat/ai-services`; branch backup/integrasi di bawah merupakan catatan pekerjaan terdahulu.
- `feat/ai-services` memuat tooling dataset, pelatihan, evaluasi, ekspor model, OpenCV, layanan FastAPI, pengujian layanan dan kontrak integrasi. Perubahan dokumen serta konfigurasi repo yang dibutuhkan layanan ikut direview dalam PR AI.
- Pengguna melakukan download dan unzip secara manual melalui `DATA-01` dan `DATA-02`, ke dalam `ai_services/data/raw/`. Pekerjaan AI membaca hasil ekstraksi untuk mencatat sumber/label, memeriksa gambar dan menyiapkan split. Tidak perlu membuat skrip download atau unzip.
- `codex/frontend-ai-integration-draft` menyimpan draf adapter, runtime browser dan proxy frontend. Seluruh `AI-40-*` dikerjakan di branch frontend/integrasi. Nama tersebut menunjukkan kondisi lokal sekarang. Branch integrasi diselaraskan dengan `main` setelah komponen yang dibutuhkan selesai direview.
- Pembacaan frontend untuk memahami kontrak dapat memakai `git show feat/frontend-ui:<path>` atau checkout/worktree terpisah. Perubahan lintas fitur melalui merge harus memiliki dependensi yang dinyatakan dan disepakati.
- Kontrak API, manifest model dan fixture menjadi keluaran serah terima dari branch AI ke frontend. Backend aplikasi menangani akun, hak akses, penyimpanan hasil ke database dan sinkronisasi. Layanan AI menangani inferensi dan akses antarlayanan. Pekerjaan database/sinkronisasi mempunyai tracker pada pekerjaan backend aplikasi.

## Keadaan setelah pemisahan branch

Dasar `feat/ai-services` dikembalikan ke `8af3236`. Snapshot seluruh pekerjaan sebelum pemisahan tersimpan pada `codex/backup-ai-services-before-split` commit `a8d8e9d`, yang juga menyimpan merge `79daaa7`. Tiga berkas frontend dipisahkan ke `codex/frontend-ai-integration-draft` commit `2e7a6ad`. Branch frontend asal tetap pada `836f54c`.

Draf Python dan kontrak dipertahankan di `ai_services/`. Pemeriksaan pemisahan memakai perbandingan blob Git untuk memastikan isi draf tetap sama. Pelatihan, benchmark, pengujian API dan verifikasi browser masih memerlukan bukti tersendiri. Unduhan FFE sebelumnya sudah dibersihkan atas permintaan pengguna. Saat pemisahan, hasil unduh dataset manual belum tersedia.

Gunakan kode `AI-xx-yy` sebagai rujukan tugas dalam percakapan, commit, dan laporan. `xx` menunjukkan kelompok tahap dan `yy` menunjukkan urutan tugas. Contoh permintaan kerja adalah `Kerjakan AI-10-01 sesuai instruksi.md`.

## Cara memakai tracker

- `TODO` berarti pekerjaan belum dimulai, `DRAFT` berarti ada kode/dokumen parsial yang perlu diselesaikan dan diverifikasi, `DOING` berarti sedang dikerjakan, `BLOCKED` berarti ada hambatan yang dicatat, dan `DONE` berarti seluruh bukti selesai sudah diperiksa.
- Sebelum bekerja, baca kembali PLAN.md, branch aktif, perubahan lokal, dan dependensi kode tugas. Ubah satu tugas yang mulai dikerjakan menjadi `DOING`. Pekerjaan persiapan yang independen dapat berjalan bersamaan.
- Saat selesai, isi catatan bukti dengan lokasi artefak, perintah atau langkah pemeriksaan, hasil, tanggal, dan commit bila tersedia. Setelah kriteria selesai terpenuhi, ubah status menjadi `DONE`. Jika pemeriksaan gagal, catat penyebab dan tindakan berikutnya.
- Catat keputusan tentang label, ambang, atau perubahan kontrak beserta alasannya. Jika mengubah cakupan, selaraskan PLAN.md dan dependensi tracker.
- Jalankan pekerjaan pada branch dan lingkup yang tercatat. Status di bawah mencerminkan keberadaan draf serta bukti yang sudah tersedia. Folder dan nama artefak yang disebutkan adalah tujuan keluaran saat implementasi. Pekerjaan integrasi dapat memakai respons contoh sesuai kontrak selama model/API dikembangkan.

## Peta tahap

| Kelompok | Tahap pada PLAN.md | Hasil utama |
| --- | --- | --- |
| `AI-00` | Persiapan lintas tahap | Kontrak dan lingkungan kerja yang dapat direproduksi |
| `AI-10` | Tahap 1, data dan protokol | Dataset berlabel, split per ikan, serta set uji HP |
| `AI-20` | Tahap 2, YOLO dan ONNX | Dua classifier, laporan, manifest, artefak ONNX, dan fixture paritas CPU |
| `AI-30` | Tahap 3, OpenCV dan API | Pipeline gambar dan layanan FastAPI |
| `AI-40` | Tahap 4, integrasi P0, branch frontend/integrasi | Penilaian foto baru melalui API dan browser, termasuk offline dan paritas WASM |
| `AI-50` | Tahap 5, deteksi P2 | Model ketiga untuk menemukan mata dan insang otomatis |

## AI-00 — Persiapan kontrak dan lingkungan

| Kode | Status | Dependensi | Instruksi dan kriteria selesai |
| --- | --- | --- | --- |
| `AI-00-01` | DONE | PLAN.md | Catat kontrak crop, label dan respons pada `ai_services/contracts.md`. Tetapkan mata `very_fresh/fresh/not_fresh`, insang `fresh/not_fresh`, kunci JSON mata `veryFresh/fresh/notFresh`, dan insang `fresh/notFresh`. Catat input spesies, versi model, `ok/unassessable`, alasan abstain, error, serta batas upload. Selesai jika contoh kedua bagian dan hasil abstain cocok dengan kontrak frontend serta PLAN.md. |
| `AI-00-02` | DRAFT | `AI-00-01` | Siapkan lingkungan Python, dependensi terkunci, konfigurasi CPU/GPU, seed, direktori data yang diabaikan Git, dan fixture gambar berizin. Pisahkan dependensi pelatihan dari runtime layanan bila perlu. Catat prosedur instalasi dalam README layanan. Selesai jika lingkungan baru dapat diinstal dan fixture memuat foto valid, orientasi EXIF, crop tidak simetris, buram, gelap, silau, dan salah bagian. |

Periksa isi lokal sebelum mengisi `train.py`. Gunakan `ai_services/data/raw/` dan `ai_services/data/interim/` sesuai PLAN.md. Folder data diabaikan Git; simpan ringkasan audit dan konfigurasi dalam Git, serta catat lokasi metadata lengkap dan bobot. Pertahankan sumber dan identitas data saat memindahkan folder.

## AI-10 — Dataset dan protokol

Download dan unzip dilakukan manual oleh pengguna. Catat sumber, versi dan checksum arsip yang diserahkan. Pertahankan label dan struktur folder asal agar augmentasi/duplikat bisa dilacak. Gunakan `prepare_data.py --raw ai_services/data/raw ...` untuk mencatat metadata hasil ekstraksi serta membuat split.

| Kode | Status | Pelaksana | Keluaran dan bukti selesai |
| --- | --- | --- | --- |
| `DATA-01` | DONE | Pengguna | Unduh FFE v1 melalui halaman resmi yang ditautkan pada PLAN.md, lalu simpan arsip/berkas di `ai_services/data/raw/ffe/`. Selesai setelah berkas dapat dibaca dan sumber, versi serta cara unduh dicatat untuk audit. |
| `DATA-02` | DONE | Pengguna | Unduh HansLab Fish Freshness Classification, versi 10 yang direncanakan, dengan format klasifikasi folder. Simpan arsip, struktur dan metadata asal di `ai_services/data/raw/hanslab/v10/`. Jika versi berbeda, catat sebelum audit. Selesai setelah berkas dapat dibaca dan versi, label serta informasi augmentasi tersedia untuk audit. |

| Kode | Status | Dependensi | Instruksi dan kriteria selesai |
| --- | --- | --- | --- |
| `AI-10-01` | DONE | `AI-00-01`, `DATA-01`, `DATA-02` | Dataset manual diterima dan telah diaudit. Verifikasi integritas arsip, ekstraksi dan sumber FFE v1 serta versi HansLab yang benar-benar diterima. Buat manifest metadata dengan sumber/versi, lisensi, ID foto asli, hash berkas, `fish_id`, sesi/lot, spesies, bagian, label, dan asal augmentasi. Bedakan metadata diketahui dan belum diketahui. Selesai jika jumlah per kelas/spesies dan kelayakan pemetaan label dicatat, termasuk pemakaian dua kelas insang HansLab dan tiga kelas mata FFE. |
| `AI-10-02` | BLOCKED | `AI-10-01` | Susun protokol foto lokal dan label bersama penilai perikanan. Mulai dari kembung, tongkol dan cakalang. Ambil mata dan insang dari ikan yang sama dengan satu ID, catat waktu serta kondisi penyimpanan, dan label setiap bagian berdasarkan protokol. Kumpulkan juga foto salah bagian/tanpa objek untuk menguji abstain. Selesai jika protokol, identitas penilai, catatan pengambilan dan distribusi sampel tersedia. |
| `AI-10-03` | DRAFT | `AI-10-01`, `AI-10-02` | Cari duplikat/turunan augmentasi, lalu buat split awal 70/15/15 per ikan dan kelompok pengambilan yang saling berkaitan. Letakkan semua bagian dan waktu foto ikan yang sama pada satu split. Kunci set uji HP lokal yang terpisah. Data dengan asal kelompok yang belum dapat dipastikan hanya dipakai untuk eksplorasi pelatihan. Selesai jika daftar split dan pemeriksaan kebocoran tersedia serta dataset klasifikasi terbentuk per bagian dan kelas. |
| `AI-10-04` | BLOCKED | `AI-10-03` | Sepakati kriteria rilis sebelum membuka hasil test. Catat minimum sampel, macro-F1, precision/recall per kelas/spesies, batas salah-segar, serta cakupan hasil yang dapat dinilai. Tetapkan kebijakan untuk kombinasi spesies/bagian dengan data kurang. Selesai jika nilai ambang dan persetujuan tim produk/perikanan tercatat dengan tanggal. |

Struktur data hasil persiapan mengikuti `ai_services/data/interim/eye/train/<kelas>`, `eye/val/<kelas>`, `eye/test/<kelas>`, serta struktur yang sama untuk `gill`. Augmentasi diterapkan pada train setelah split. Metadata identitas tetap dipakai untuk memeriksa kebocoran walaupun loader klasifikasi memakai folder kelas.

## AI-20 — Pelatihan dua YOLO dan ekspor ONNX

| Kode | Status | Dependensi | Instruksi dan kriteria selesai |
| --- | --- | --- | --- |
| `AI-20-01` | DONE | `AI-00-02`, `AI-10-03` | Buat entry point `train.py` dengan `--part eye|gill`, dataset, seed, konfigurasi dan lokasi output yang eksplisit. Mulai dari `yolo11n-cls.pt`, ukuran 224, maksimum 50 epoch dan early stopping. Selaraskan resize/crop val dengan rencana inferensi dan batasi augmentasi agar area mata serta warna insang tetap bermakna. Selesai jika smoke run kedua bagian dapat selesai dan konfigurasi serta urutan kelas tersimpan. |
| `AI-20-02` | DONE | `AI-20-01` | Latih classifier mata tiga kelas dan insang dua kelas. Pilih `best.pt` berdasarkan validasi. Catat dataset/split, versi library, seed, transform, perangkat, log dan checkpoint setiap run. Selesai jika dua checkpoint tersedia, kelas keluaran benar, dan sumber setiap hasil dapat ditelusuri. |
| `AI-20-03` | BLOCKED | `AI-20-02`, `AI-10-04` | Ukur kalibrasi dan pilih aturan abstain pada validation, termasuk foto salah bagian/tanpa objek. Evaluasi test terkunci satu kali setelah pilihan model dan ambang final. Laporkan confusion matrix, macro-F1, precision/recall per kelas/spesies, salah-segar dan cakupan. Selesai jika model card memuat hasil nyata dan daftar kombinasi spesies/bagian yang boleh aktif. Jika kriteria gagal, catat hasil dan jalur manualnya. Set test tetap dipisahkan dari pemilihan revisi berikutnya. |
| `AI-20-04` | DONE | `AI-20-03` | Ekspor dua model ke ONNX FP32 statis `1×3×224×224`. Buat manifest bundle dengan checksum SHA-256, versi, label berurutan, spesies aktif, nama/bentuk tensor, preprocessing, tipe output dan aturan abstain. Catat atribusi serta kewajiban distribusi model. Selesai jika artefak dan manifest cocok serta output memakai softmax tepat sekali sesuai tipe yang terverifikasi. |
| `AI-20-05` | DONE | `AI-20-04`, `AI-30-02` | Bandingkan tensor dan probabilitas PyTorch dengan ONNX Runtime CPU pada fixture yang sama. Tetapkan toleransi numerik, lalu periksa label, abstain dan keputusan di sekitar ambang. Ukur ukuran dan kecepatan baseline. Jika mencoba kuantisasi, laporkan dampaknya sebelum memilihnya. Serahkan fixture, tensor dan probabilitas acuan beserta bundle kandidat ke branch integrasi. Selesai jika paritas CPU dan artefak serah terima terverifikasi. Paritas browser WASM diverifikasi pada `AI-40-03`. |

Versi P0 memakai dua classifier untuk beberapa jenis ikan, dengan validasi per jenis. Jenis ikan dipilih operator. Catat dukungan spesies per bagian pada manifest. Nilai confidence tinggi pada satu foto harus tetap mengikuti aturan dukungan dan quality gate.

## AI-30 — OpenCV dan FastAPI

| Kode | Status | Dependensi | Instruksi dan kriteria selesai |
| --- | --- | --- | --- |
| `AI-30-01` | DONE | `AI-00-02` | Implementasikan validasi signature JPEG/PNG, batas byte dan dimensi sebelum alokasi penuh, decode OpenCV, orientasi EXIF tepat sekali, serta validasi bentuk crop. Gunakan batas upload awal 5 MiB dan sisi crop klien maksimal 1.280 px sesuai kontrak. Selesai jika fixture valid/orientasi lolos dan fixture rusak/salah format/melebihi batas menghasilkan error terstruktur. |
| `AI-30-02` | DRAFT | `AI-30-01`, `AI-20-01` | Buat pipeline quality gate dan tensor. Hitung luminans, silau dan varians Laplacian pada ROI grayscale 160×160, lalu BGR→RGB, resize 224×224, skala float32 [0,1], dan NCHW. Selaraskan kernel, tepi, interpolasi dan transform dengan train/val. Kalibrasi ambang kualitas menggunakan data validasi lokal. Selesai jika fixture mempunyai nilai acuan, keputusan kualitas dan tensor untuk diserahkan ke branch integrasi. |
| `AI-30-03` | DONE | `AI-30-02`, `AI-20-04` | Muat dua sesi ONNX sekali per proses, pilih model berdasarkan `part`, periksa dukungan spesies, jalankan inferensi, dan validasi probabilitas finite, rentang serta jumlahnya. Terapkan quality gate dan abstain sesuai manifest. Selesai jika kasus mata, insang, spesies belum didukung dan confidence rendah menghasilkan keluaran sesuai kontrak. |
| `AI-30-04` | DONE | `AI-30-03`, `AI-00-01` | Buat `POST /v1/freshness/predict` multipart dengan `image`, `part`, `species`; respons `ok`/`unassessable`; serta error `requestId/code/message`. Sediakan OpenAPI, `GET /healthz` dan `GET /readyz`. Selesai jika kontrak kedua bagian, probabilitas null saat abstain, validasi input, dan readiness 503 saat bundle gagal dimuat sudah diperiksa. |
| `AI-30-05` | DRAFT | `AI-30-04` | Siapkan image layanan dengan dependensi/artefak terkunci, worker inferensi terbatas di luar event loop, timeout, batas antrean, dan batas request pada layanan. Catat autentikasi antarlayanan, konfigurasi staging privat, log request/versi/latensi dan pelepasan foto sementara. Serahkan persyaratan proxy ke branch integrasi/backend aplikasi. Uji beberapa request serentak dan kegagalan model. Selesai jika smoke test staging berhasil dan laporan p50/p95 decode, preprocessing serta inferensi tersedia. |

Penyusunan kontrak dan pipeline gambar bisa dimulai saat pelatihan berjalan. Pengujian dengan model nyata menunggu manifest dan artefak. Bukti menggunakan fixture atau model sementara harus menyebutkan kondisi itu. Perhitungan grade akhir tetap mengacu ke fungsi domain frontend setelah bau dan tekstur diisi.

## AI-40 — Integrasi frontend dan offline P0 pada branch terpisah

Lokasi pekerjaan adalah branch frontend/integrasi. Draf awal ada pada `codex/frontend-ai-integration-draft`. PR tahap ini menampilkan perubahan adapter, proxy dan UI terhadap basis frontend. Implementasi serta pemeriksaannya dilanjutkan setelah kontrak dan artefak AI tersedia. Kontribusi AI pada tahap ini berupa kontrak, model dan fixture. Verifikasi akun, penyimpanan server serta sinkronisasi memerlukan backend aplikasi yang tersedia dan dikonfigurasi.

| Kode | Status | Dependensi | Instruksi dan kriteria selesai |
| --- | --- | --- | --- |
| `AI-40-01` | DRAFT | `AI-00-01`, `AI-20-01` | Sambungkan crop kamera/editor unggah beresolusi asli ke input adapter `FreshnessModel` untuk mata dan insang, beserta `speciesId`. Petakan overlay dengan memperhitungkan orientasi, skala dan offset `object-fit: cover`. Pertahankan buffer kualitas 160×160 terpisah. Selesai jika fixture kamera/unggah membuktikan potongan area yang dipilih benar, termasuk foto portrait/landscape. |
| `AI-40-02` | DRAFT | `AI-40-01`, `AI-30-04` | Sambungkan adapter API, proxy dan keadaan UI untuk dua bagian. Terapkan batas request pada proxy serta autentikasi melalui backend aplikasi yang disepakati. Tangani loading, foto ulang, pergantian spesies, timeout, error, abstain dan input manual. Batalkan atau abaikan hasil request lama. Simpan sumber dan versi aktual per hasil, termasuk campuran model/manual. Selesai jika alur foto baru sampai catatan penilaian berhasil serta hasil lama gagal menimpa foto/spesies baru. |
| `AI-40-03` | DONE | `AI-40-01`, `AI-20-05` | Tambahkan runtime browser dengan preprocessing yang cocok, cache manifest/dua model/runtime WASM dan verifikasi checksum. Aktifkan bundle lengkap secara atomik. Bandingkan tensor, probabilitas dan keputusan WASM terhadap fixture PyTorch/ONNX CPU dari `AI-20-05`. Periksa dampak kuantisasi pada WASM bila digunakan. Tangani cache belum siap, rusak, atau update terputus dengan penilaian manual. Selesai jika laporan paritas browser tersedia dan reload production build tanpa sinyal tetap dapat menilai menggunakan bundle yang valid. |
| `AI-40-04` | BLOCKED | `AI-40-02`, `AI-40-03`, `AI-30-05` | Uji `/kub/darat` dari foto, dua prediksi, bau/tekstur, skor/grade, override dengan alasan hingga simpan dan tampilkan kembali catatan. Periksa sumber, versi, audit dan aturan rantai dingin SPPG. Uji mode simulasi, manual, API gagal dan offline. Ukur total bobot ≤12 MB serta target inferensi ≤1,5 detik per crop di Android kelas menengah. Laporkan p95 hangat dan waktu unduh/inisialisasi terpisah. Selesai jika laporan P0 mengaitkan setiap hasil dengan bundle/perangkat, seluruh alur dan target rilis lolos, serta kombinasi spesies/bagian yang diaktifkan sesuai hasil evaluasi. |

Target performa berasal dari PLAN.md dan PRD. Jika target rilis belum terpenuhi, tandai pekerjaan perbaikannya sebelum menyatakan P0 siap. Persistensi offline dan sumber hasil perlu diverifikasi pada build produksi setelah cache aktif. Sinkronisasi database lintas perangkat mengikuti pekerjaan backend yang dirujuk pada catatan integrasi.

## AI-50 — Deteksi otomatis P2

Mulai tahap ini setelah classifier dan layanan P0 memenuhi kriteria AI pada `AI-20-03`, `AI-20-05` dan `AI-30-05`. Model tambahan memakai `yolo11n.pt` untuk mendeteksi lokasi `eye` dan `gill`. Kedua classifier P0 menilai crop yang dihasilkan, sehingga jumlah model menjadi tiga. Pekerjaan detektor dan API foto utuh berada pada branch AI. Perubahan kamera/UI serta pengujian browser menyertai PR integrasi terpisah.

| Kode | Status | Dependensi | Instruksi dan kriteria selesai |
| --- | --- | --- | --- |
| `AI-50-01` | BLOCKED | `AI-20-03`, `AI-20-05`, `AI-30-05` | Kumpulkan dan anotasi foto ikan utuh dengan kotak mata/insang yang terlihat. Sertakan variasi posisi, bagian tertutup dan beberapa ikan. Gunakan identitas ikan serta kelompok split P0 agar tidak terjadi kebocoran lintas tahap. Selesai jika pedoman anotasi, daftar foto, distribusi kotak dan pemeriksaan split tersedia. |
| `AI-50-02` | BLOCKED | `AI-50-01` | Latih detektor `yolo11n.pt`, pilih ambang deteksi pada validasi, dan ukur recall lokasi serta IoU/mAP per bagian pada test terpisah. Catat versi dan checkpoint. Selesai jika laporan deteksi mencakup gagal menemukan objek dan ambigu beberapa ikan serta mendefinisikan fallback crop terpandu. |
| `AI-50-03` | DRAFT | `AI-50-02` | Hubungkan deteksi→pemetaan koordinat letterbox ke foto asli→margin→crop persegi→quality gate→dua classifier P0. Tambahkan kontrak endpoint foto utuh dengan keluaran per bagian. Uji koordinat tepi gambar, objek kecil, bagian tertutup dan target ambigu. Selesai jika crop sesuai objek dan kegagalan memberi instruksi crop terpandu. |
| `AI-50-04` | TODO | `AI-50-03` | Uji pipeline layanan dari foto utuh HP sampai kotak, crop dan probabilitas. Bandingkan hasil crop otomatis terhadap crop terpandu pada set uji yang sama, termasuk cakupan abstain dan latensi. Serahkan fixture hasil ke branch integrasi untuk pengujian tampilan, skor dan grade. Selesai jika laporan layanan memenuhi kriteria kualitas AI P0 dan keputusan aktivasi deteksi tercatat. |

## Catatan bukti dan kelanjutan

Tambahkan satu entri berikut setiap kali status berubah. Isi placeholder dengan hasil yang benar-benar diperiksa. Tautkan artefak atau laporan besar agar tracker tetap mudah dibaca.

```text
Kode tracker = AI-10-01
Status = TODO / DRAFT / DOING / BLOCKED / DONE
Tanggal = YYYY-MM-DD WIB
Pelaksana = nama
Branch dan commit = branch / hash atau perubahan lokal
Artefak = lokasi manifest, model, kode, atau laporan
Pemeriksaan = perintah atau langkah yang dijalankan
Hasil = keluaran dan kaitannya dengan kriteria selesai
Hambatan dan keputusan = isi bila ada
Langkah berikutnya = kode tracker yang dapat dilanjutkan
```

## Bukti status saat pemisahan, 11 November 2026 WIB

| Kode | Bukti yang tersedia | Yang masih perlu diverifikasi |
| --- | --- | --- |
| `AI-00-01` | Draf `ai_services/contracts.md` dipertahankan dari snapshot backup | Contoh respons dan kesesuaian kontrak kedua bagian |
| `AI-00-02` | Draf requirements runtime/training dan direktori `.venv` lokal | Instalasi bersih, lock lengkap dan kelengkapan fixture |
| `AI-10-01` | Unduhan lama sudah dibersihkan, dataset manual belum tersedia | Berkas dari `DATA-01`/`DATA-02`, integritas dan audit label |
| `AI-20-01` | Draf `ai_services/train.py` | Smoke run dua bagian dengan split yang valid |
| `AI-20-04` | Draf `ai_services/export_models.py` | Checkpoint terlatih, ekspor nyata dan manifest terverifikasi |
| `AI-30-01`, `AI-30-02` | Draf `ai_services/image_pipeline.py` | Hasil uji decode, kualitas, tensor dan kalibrasi |
| `AI-30-03` | Draf `ai_services/inference.py` | Bundle nyata dan pengujian jalur inferensi |
| `AI-30-04` | Draf `ai_services/app.py` dan `ai_services/tests/test_api.py` | Eksekusi tes, kontrak endpoint dan readiness |
| `AI-40-02`, `AI-40-03` | Tiga draf frontend pada branch integrasi commit `2e7a6ad` | Instalasi dependensi, sambungan UI, keamanan proxy, paritas dan offline |

Dataset manual telah diterima. Kelanjutan mengikuti bukti terbaru dan hambatan validasi di bawah. Baca status dan bukti terakhir, periksa ulang keadaan repo, lalu pilih tugas dengan dependensi terpenuhi. Semua kode `AI-00` sampai `AI-50` tetap dapat dirujuk setelah pemisahan.

## Bukti kelanjutan dari dataset pengguna

- `DATA-01`, `DATA-02`, `AI-10-01` selesai melalui audit awal kedua arsip dan pemeriksaan gambar. Checksum arsip, jumlah kelas serta batas metadata ada pada `reports/dataset-audit.json`. Semua 6.086 kandidat lolos pemeriksaan gambar pada `reports/image-audit.json`. Pengunduhan/ekstraksi berikutnya dilakukan manual; pencatatan metadata tersedia di `prepare_data.py`.
- `AI-00-01` diverifikasi melalui schema OpenAPI, contoh JSON kontrak serta pengujian respons kedua bagian dan abstain. Lingkungan GPU yang digunakan tercatat pada `reports/environment.json`. Instalasi runtime/test bersih lulus pada `.venv-runtime` tanpa paket training atau pewarisan site-packages; `pip check` bersih dan 28 tes lulus. Bukti ada pada `reports/runtime-environment.json`. Fixture foto lapangan/salah bagian masih menunggu data lokal.
- `AI-10-03` menghasilkan split eksplorasi pada `ai_services/data/interim/freshness-source-v1`. `split-report.json` menyimpan proporsi aktual dan `release_eligible=false`. FFE memakai blok spesies, sedangkan HansLab memakai keluarga sumber yang identitas individunya belum terverifikasi.
- `AI-20-01` dan `AI-20-02` telah menjalankan kedua classifier sampai early stopping. Checkpoint mata ada pada `runs/classify/runs/freshness/eye-source-v2/weights/`, insang pada `runs/freshness/gill-source-v1/weights/`. Salinan `best-portable.pt` memperbaiki referensi modul transform pada checkpoint awal. Checksum keduanya ada pada `reports/portable-checkpoints.json`.
- `AI-20-03` mempunyai evaluasi sumber pada `reports/eye-validation.json` dan `reports/gill-validation.json`. Status masih BLOCKED untuk kriteria rilis yang membutuhkan data HP lokal berlabel penilai, identitas ikan serta ambang yang disepakati. Test rilis tetap dikunci.
- `AI-20-04` menghasilkan bundle FP32 `ai_services/artifacts/source-v1`. `reports/onnx-parity.json` membuktikan paritas PyTorch/ONNX CPU dan ukuran gabungan 12.291.412 byte. Kandidat INT8 dan campuran dievaluasi terpisah. Ukuran, perubahan metrik serta kompatibilitas browser menentukan pilihan artefak.
- `AI-30-01`, `AI-30-03`, `AI-30-04` diverifikasi melalui 28 tes lokal API/data/deteksi, termasuk konkurensi dan batas body. Bundle nyata sudah dimuat layanan pada loopback. Spesies tetap mengikuti manifest, dengan daftar aktif kosong selama validasi rilis belum terpenuhi.
- `AI-30-02` mempunyai fixture preprocessing dengan checksum tensor identik di Python dan JavaScript. Benchmark desktop ada pada `reports/image-benchmark.json`. Kalibrasi kualitas pada kondisi dermaga tetap menunggu data lokal.
- `AI-40-*` berjalan di worktree branch integrasi terpisah. Pemeriksaan awal `scripts/verify-ai.mjs` lulus untuk tensor, validasi respons dan koordinat crop portrait/landscape. Build produksi, typecheck, lint, 215 unit test dan 40 tes Playwright telah lulus. Paritas numerik dan reload offline dua model sudah diverifikasi; ringkasan ada pada `reports/frontend-verification.json`.
- `AI-50-01` dan `AI-50-02` menunggu foto ikan utuh beranotasi kotak serta metadata identitas. `AI-50-03` mempunyai kode pipeline dan tes dengan detektor sintetis. Detektor nyata serta evaluasi P2 tetap menunggu data tersebut.

Pengguna mengonfirmasi foto HP lokal berlabel dan anotasi P2 **belum tersedia**. Validasi rilis serta pelatihan detektor menunggu data tersebut. Data sumber sudah cukup untuk eksperimen classifier, tetapi belum membuktikan kelayakan aktivasi kembung/tongkol/cakalang.

## Bukti pemeriksaan runtime dan integrasi

- `AI-20-05` selesai untuk paritas CPU, kompresi dan serah terima. Kandidat `source-experiment-v1-int8w-eye` berukuran 11.315.060 byte. Dampak kuantisasi terhadap validation, checkpoint, atribusi dan keputusan belum mengaktifkan spesies dicatat pada `MODEL_CARD.md`. `reports/weightonly-quantization.json` dan `reports/wasm-node-weightonly.json` menyimpan hasil fixture.
- `AI-40-03` selesai melalui paritas lima fixture pada Chromium dan pengujian production build setelah reload offline. Tes juga membuktikan update terputus mempertahankan bundle lama dan checksum cache rusak beralih ke manual. Aktivasi spesies dalam tes dibatasi pada konteks browser sementara; manifest distribusi tetap kosong. Bukti ada pada `reports/wasm-browser-weightonly.json` dan `reports/frontend-verification.json`.
- `AI-40-01` mempunyai crop kamera berdasarkan koordinat panduan dan editor unggahan dengan perbesaran/pergeseran serta preview. Fixture geometri dan pemeriksaan piksel hasil crop portrait/landscape lulus pada desktop/touch viewport. Implementasi crop selesai; pemeriksaan kamera HP fisik belum dilakukan, sehingga status tetap DRAFT.
- `AI-40-02` mempunyai wiring kedua bagian, izin unggah eksplisit, loading/manual, respons terlambat yang diabaikan, serta penyimpanan sumber/versi dan audit. Proxy mempunyai pengujian token server, identitas/role, origin, batas body dan kegagalan upstream. Produksi masih membutuhkan pengikatan sesi operator dari backend akun; penyimpanan yang diuji memakai repository demo lokal. Rincian terdapat pada `AI_INTEGRATION.md` di branch integrasi.
- `AI-40-04` terhambat data lokal/aktivasi spesies dan akses perangkat Android kelas menengah. Alur contoh, manual, dua respons API sintetis, grade, audit, penyimpanan lokal serta reload offline sudah lulus pada laptop. Ukuran viewport mobile tidak menjadi bukti benchmark Android.
- `AI-30-05` mempunyai pembatas konkurensi yang diuji, timeout, token antarlayanan, log metadata request dan Dockerfile. HTTP loopback nyata lulus melalui `smoke_api.py`; waktunya memuat decode/kualitas/abstain, bukan eksekusi classifier karena spesies belum aktif. Image container, CPU Linux/staging eksternal dan backend akun/database belum diuji.

Status DONE pada pelatihan/ekspor/paritas mencatat keluaran eksperimen yang telah terbukti. Kriteria rilis, kalibrasi kualitas lokal dan aktivasi spesies tetap dikunci oleh `AI-10-02`, `AI-10-04` serta `AI-20-03`. Implementasi detektor sintetis tidak menggantikan model P2 terlatih.

- Lingkungan runtime/test baru dipasang dari lock tanpa mewarisi paket global; tidak ada Torch atau Ultralytics di dalamnya. `reports/runtime-environment.json` mencatat checksum lock, versi paket, hasil `pip check` dan 28 tes layanan. `AI-00-02` tetap DRAFT karena kelengkapan fixture foto lokal termasuk salah bagian belum tersedia.
- `reports/http-smoke.json` terbaru berasal dari API kandidat ringkas pada runtime bersih dengan autentikasi produksi aktif di loopback. Kedua bagian abstain sesuai daftar spesies kosong, request tanpa token ditolak 401, format rusak ditolak dan detektor tidak tersedia mengembalikan 503. Server uji dihentikan setelah verifikasi.
- Integrasi frontend lulus build produksi, typecheck, lint, 215 unit test dan 40 tes Playwright tanpa skip. Tes regresi memastikan input unggah tetap terpasang ketika izin kamera ditolak. Ringkasan per kasus ada pada `reports/frontend-verification.json`.

## Penataan folder dan skrip manual

Seluruh folder data dipindahkan ke `ai_services/data/`. Path pada CSV sumber dan manifest split sudah mengikuti lokasi baru; label, kelompok dan pembagian split dipertahankan. `.gitignore`, konteks Docker, README serta PLAN.md memakai lokasi yang sama. Dataset, arsip pengguna, checkpoint dan laporan evaluasi tetap disimpan.

Skrip download/unzip dihapus. Pencatatan metadata hasil ekstraksi dipusatkan pada `prepare_data.py --raw ...`; pemeriksaan gambar dan pembagian split tetap otomatis karena merupakan bagian pelatihan. Dua tes ekstraksi diganti dengan tes kebutuhan ekstraksi manual dan ketepatan label/provenance; total 28 tes layanan tetap lulus. Tidak ada branch/worktree baru, commit, atau push pada penataan ini.

Penghapusan cache installer `ai_services/data/interim/npm-cache/`, `wheelhouse/`, helper sementara, log instalasi lama serta folder kosong lama ditolak kebijakan eksekusi otomatis. Berkas sementara tersebut masih tersimpan dan tidak dipakai pipeline; data di bawah `ai_services/data/` serta log tetap diabaikan Git.

Verifikasi setelah pemindahan: 6.086 baris metadata identik selain lokasi path; hash seluruh 6.086 gambar hasil split dan kedua arsip asli cocok. Direktori `data/` di root sudah tidak ada, dan data pada lokasi baru tetap diabaikan Git.
