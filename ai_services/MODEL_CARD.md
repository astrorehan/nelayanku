# Model kesegaran sumber v1

Status: eksperimen, belum layak diaktifkan untuk pengguna. Dua classifier YOLO11n-cls dilatih menggunakan dataset yang disediakan pengguna. Model detektor P2 belum dilatih. `supportedSpecies=[]` pada kedua classifier; API dan browser memberi hasil `unassessable` dan menawarkan penilaian manual.

## Data dan penggunaan

Mata memakai 4.390 foto FFE v1, dengan label tiga kelas berdasarkan kategori penyimpanan sumber. Insang memakai 1.696 foto HansLab v10, dengan label dua kelas. HansLab telah memuat augmentasi; identitas ikan serta spesiesnya belum diketahui. Foto mata biner HansLab tidak digabung ke label mata tiga kelas. Sumber, checksum, lisensi dan distribusi kelas ada pada [dataset-audit.json](reports/dataset-audit.json).

FFE dibagi per blok spesies secara konservatif: 1.874 train, 2.016 validation, 500 test. Validation mencakup Nibea albiflora, Oreochromis niloticus dan Upeneus moluccensis. Kembung berada di train; hasil validation ini tidak membuktikan performa kembung pada HP lokal. HansLab dibagi berdasarkan keluarga nama sumber: 1.188 train, 245 validation, 263 test. Pengelompokan tersebut belum dapat menjamin pemisahan individu ikan. Seluruh hasil dinyatakan eksploratif. Test belum dipakai untuk memilih model atau kuantisasi.

Pengguna mengonfirmasi data HP berlabel penilai perikanan dan foto ikan utuh beranotasi belum tersedia. Dukungan kembung, tongkol dan cakalang belum dibuktikan. Model ini tidak menentukan keamanan konsumsi, kontaminasi atau kelayakan pangan.

## Pelatihan dan hasil validation

Kedua model memakai seed 42, input RGB 224, batch 16, maksimum 50 epoch, patience 10, AMP nonaktif dan transform crop/resize yang sama dengan runtime. Run mata selesai 12 epoch dengan checkpoint terbaik epoch 2; insang selesai 24 epoch dengan checkpoint terbaik epoch 14. Perangkat dan versi dependensi tercatat pada [environment.json](reports/environment.json). Checksum checkpoint portabel tersimpan di [portable-checkpoints.json](reports/portable-checkpoints.json).

| Kandidat | Akurasi mata | Macro-F1 mata | Tidak segar diprediksi segar/sangat segar | Akurasi insang | Macro-F1 insang | Tidak segar diprediksi segar |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| FP32 | 57,84% | 0,5605 | 356 / 597 | 96,33% | 0,9629 | 5 / 135 |
| INT8 penuh | 56,99% | lihat laporan | 332 / 597 | 93,47% | lihat laporan | 6 / 135 |
| INT8 bobot mata + FP32 insang | 57,69% | 0,5586 | 359 / 597 | 96,33% | 0,9629 | 5 / 135 |

Angka di atas adalah argmax sebelum quality/confidence gate, bukan akurasi layanan setelah abstain. Confusion matrix, precision/recall per kelas, hasil per spesies, ECE dan cakupan confidence tersedia pada laporan `eye-validation.json`, `gill-validation.json` dan varian kuantisasi. Mata masih mempunyai kesalahan salah-segar yang besar. Angka insang berasal dari data yang identitas individunya belum terverifikasi, sehingga tidak boleh dianggap bukti generalisasi lapangan.

## Ekspor dan kompresi

Bundle FP32 berukuran 12.291.412 byte, melebihi target 12 MB desimal. INT8 penuh 3.306.901 byte menurunkan akurasi insang 2,86 poin persentase. Kandidat ringkas yang diteruskan untuk pengujian runtime adalah `source-experiment-v1-int8w-eye`: bobot Conv terbesar model mata memakai INT8 per channel dengan dekuantisasi, aktivasi tetap FP32 dan model insang tetap FP32. Ukuran gabungan 11.315.060 byte. Penurunan akurasi mata terhadap FP32 adalah 0,15 poin persentase pada validation.

Kandidat ringkas tetap eksperimen. Ukuran di atas hanya dua file ONNX; runtime WASM, JavaScript dan aset aplikasi dihitung terpisah. Manifest menentukan urutan label secara eksplisit: mata `fresh, not_fresh, very_fresh`; insang `fresh, not_fresh`. API memetakan label ke kunci respons dan tidak mengasumsikan urutan domain.

## Paritas dan performa

Lima fixture dari train, satu per kelas/bagian, dipakai untuk pemeriksaan numerik. FP32 PyTorch/ONNX CPU berbeda kurang dari 0,000001. Pada kandidat ringkas, lima argmax tetap sama dengan FP32 dan perbedaan probabilitas maksimum kurang dari 0,00092. ONNX Runtime WASM di Node dan Chromium cocok dengan referensi ONNX CPU dalam toleransi 0,0001; perbedaan terbesar pada pengujian Chromium sekitar 0,0000012. Bukti ada pada laporan `onnx-parity.json`, `weightonly-quantization.json`, `wasm-node-weightonly.json` dan `wasm-browser-weightonly.json`.

Inferensi CPU desktop per crop sekitar 6–8 ms pada fixture yang diuji. Chromium desktop menunjukkan maksimum sampel hangat sekitar 29,9 ms; hanya lima pengulangan hangat per fixture dan dua ukuran viewport. Viewport mobile tetap berjalan pada laptop, sehingga hasil tersebut bukan benchmark Android. Waktu inisialisasi dan inferensi dicatat terpisah. Validasi perangkat Android kelas menengah, unduhan pada jaringan lapangan, container Linux dan staging eksternal belum dilakukan.

## Jalur menuju rilis

Kumpulkan data lokal sesuai [LOCAL_DATA.md](LOCAL_DATA.md), verifikasi individu serta sesi, kalibrasi kualitas/abstain, dan sepakati batas salah-segar bersama penilai. Perbaiki hasil classifier mata sebelum membuka test terkunci. Aktifkan spesies per bagian hanya setelah kriteria terpenuhi. Untuk P2, anotasi lokasi mata/insang pada foto ikan utuh diperlukan sebelum pelatihan serta evaluasi detektor. Tracker [instruksi.md](instruksi.md) menyimpan status setiap tugas.
