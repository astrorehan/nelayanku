# AI Services Nelayanku

Pekerjaan layanan berada di `feat/ai-services`. Integrasi UI dan browser berada di `codex/frontend-ai-integration-draft`, pada worktree terpisah. [instruksi.md](instruksi.md) mencatat status dan kriteria setiap tahap. Dua classifier sudah dilatih dan diekspor; lihat hasil serta batas penggunaan pada [MODEL_CARD.md](MODEL_CARD.md). Seluruh bundle eksperimen mempunyai daftar spesies aktif kosong.

## Lingkungan

Python 3.10 digunakan pada mesin ini. Lingkungan lokal `ai_services/.venv-gpu` mewarisi paket CUDA yang sudah terpasang, lalu menambahkan ONNX dan pytest tanpa mengubah instalasi global. Versi dan perangkat yang diperiksa dicatat di [reports/environment.json](reports/environment.json). Runtime/test telah dipasang ulang pada `.venv-runtime` tanpa pewarisan paket, dengan `pip check` bersih dan 28 tes lulus; lihat [runtime-environment.json](reports/runtime-environment.json). Instalasi baru dapat menggunakan virtual environment biasa dan requirements terpisah.

```powershell
py -3.10 -m venv ai_services/.venv
ai_services/.venv/Scripts/python.exe -m pip install -r ai_services/requirements-test.lock
```

Runtime tanpa tooling pengujian memakai `requirements-runtime.lock`. Lock menyertakan dependensi transitif; file `.txt` mencatat dependensi langsung. Untuk pelatihan GPU, pasang PyTorch dan torchvision yang sesuai perangkat melalui distribusi resmi PyTorch, kemudian requirements training. Lingkungan yang diuji memakai Torch 2.5.1 dan torchvision 0.20.1 dengan CUDA 12.1. Instalasi CUDA bersih belum diuji ulang; `requirements-training.lock` merekam resolusi lingkungan pelatihan yang digunakan.

```powershell
ai_services/.venv/Scripts/python.exe -m pip install torch==2.5.1 torchvision==0.20.1 --index-url https://download.pytorch.org/whl/cu121
ai_services/.venv/Scripts/python.exe -m pip install -r ai_services/requirements-training.txt
```

## Dataset dan split

Download dan unzip dilakukan manual. Simpan FFE yang sudah diekstrak di `ai_services/data/raw/ffe/` dan HansLab v10 di `ai_services/data/raw/hanslab/v10/`, dengan struktur folder asal tetap utuh. Arsip pengguna tetap disimpan di `ai_services/data/raw/`. Audit awal arsip tercatat pada `reports/dataset-audit.json`.

`prepare_data.py` mencatat label, sumber, checksum gambar dan kelompok split dari folder hasil ekstraksi, lalu membentuk dataset klasifikasi. Tidak ada skrip download atau unzip. Perintah berikut membuat versi baru; gunakan nama output yang belum ada agar split sebelumnya tetap tersimpan.

```powershell
python -m ai_services.prepare_data --raw ai_services/data/raw --metadata ai_services/data/interim/source-metadata.csv --output ai_services/data/interim/freshness-source-v2 --exploratory
python -m ai_services.audit_images
```

Semua 4.390 foto FFE menjadi kandidat mata tiga kelas. Dari HansLab, 1.696 foto insang menjadi kandidat dua kelas. Foto mata biner HansLab tetap berada dalam arsip sumber. Identitas ikan dan spesies HansLab belum terverifikasi, sehingga split berbasis keluarga filename diberi tanda eksplorasi. Semua foto FFE dari spesies yang sama diletakkan dalam satu split untuk menjaga pemisahan individu secara konservatif. Proporsi jumlah foto akhirnya tercatat pada `split-report.json` karena ukuran kelompok berbeda-beda.

Persiapan rilis menggunakan metadata lokal terverifikasi dan menghilangkan flag `--exploratory`. [LOCAL_DATA.md](LOCAL_DATA.md) mendeskripsikan label, identitas ikan, persetujuan penilai serta anotasi detektor yang masih dibutuhkan.

## Pelatihan, evaluasi dan ekspor

```powershell
python -m ai_services.train --part eye --data ai_services/data/interim/freshness-source-v1/eye --device 0 --epochs 50 --batch 16 --name eye-source-v1
python -m ai_services.train --part gill --data ai_services/data/interim/freshness-source-v1/gill --device 0 --epochs 50 --batch 16 --name gill-source-v1
python -m ai_services.evaluate --checkpoint runs/freshness/eye-source-v1/weights/best.pt --dataset ai_services/data/interim/freshness-source-v1 --part eye --split val --report ai_services/reports/eye-validation.json
```

Gunakan lokasi `saveDir` yang dicetak trainer untuk mengambil checkpoint run tertentu. Evaluator membaca kelas dari checkpoint dan mengeluarkan laporan per spesies, confusion matrix, kesalahan tidak segar menjadi segar, ECE dan cakupan confidence. Pilihan model dan ambang memakai validation. Test rilis dikunci sampai kriteria serta konfigurasi final disepakati.

```powershell
python -m ai_services.export_models --eye runs/freshness/eye-source-v1/weights/best.pt --gill runs/freshness/gill-source-v1/weights/best.pt --version source-experiment-v1 --output ai_services/artifacts/source-v1
```

Ekspor menghasilkan dua ONNX FP32 dan manifest ber-checksum dalam satu direktori versi. `supportedSpecies` awal kosong. Aktivasi mengikuti bukti evaluasi lokal dan paritas runtime. Artefak hasil pelatihan disimpan di direktori yang diabaikan Git, sedangkan laporan serta konfigurasi direview dalam branch layanan.

Kandidat kompresi yang diuji memakai INT8 bobot mata dan FP32 insang, berukuran 11.315.060 byte. Selalu gunakan direktori baru ketika mengekspor atau menguantisasi agar versi lama tetap tersedia.

```powershell
python -m ai_services.quantize_models --manifest ai_services/artifacts/source-v1/manifest.json --dataset ai_services/data/interim/freshness-source-v1 --output ai_services/artifacts/source-v1-weightonly --parts eye --weight-only
```

## API dan pengujian

```powershell
python -m pytest ai_services/tests -q
$env:AI_MANIFEST = 'ai_services/artifacts/source-v1-weightonly/manifest.json'
python -m uvicorn ai_services.app:app --host 127.0.0.1 --port 8000 --workers 1 --limit-concurrency 16
```

`GET /healthz` memeriksa proses. `GET /readyz` memeriksa bundle dan memberi informasi ketersediaan detektor. Prediksi crop memakai `POST /v1/freshness/predict`. Foto utuh memakai `POST /v1/freshness/detect` setelah detektor tersedia. Input, respons dan aturan abstain dijelaskan di [contracts.md](contracts.md).

Docker menggunakan konteks root repo dengan `docker build -f ai_services/Dockerfile .`. Saat menjalankan image, mount bundle read-only ke `/models` dan atur `AI_SERVICE_TOKEN`. Produksi memerlukan token antarlayanan. Integrasi backend menyimpan token itu di server, membatasi request, dan memeriksa hak akses pengguna sesuai kontrak. Foto diproses sementara dan tidak masuk ke log.

Tes ONNX sintetis hanya membuktikan alur layanan dan aturan validasi. Metrik model terlatih dibuktikan melalui laporan evaluasi pada data yang tercatat.

`python -m ai_services.smoke_api --url http://127.0.0.1:8000` menguji HTTP loopback dengan bundle eksperimen yang belum mengaktifkan spesies. Waktu yang dicatat meliputi decode, kualitas dan abstain; inferensi classifier diukur terpisah oleh `verify_bundle.py`. Log layanan memuat request ID, metode/path, status, versi dan durasi, tanpa isi foto atau token.

## Serah terima ke frontend

```powershell
python -m ai_services.publish_bundle --manifest ai_services/artifacts/source-v1-weightonly/manifest.json --frontend ../nelayanku-frontend-ai-integration
node --experimental-strip-types ../nelayanku-frontend-ai-integration/scripts/verify-ai.mjs ai_services/fixtures/preprocessing.json
```

Publisher memeriksa bundle dan menulis file model dengan nama berbasis checksum, kemudian mengaktifkan manifest publik setelah kedua model tersimpan. Branch integrasi menangani WASM, cache offline, input kamera, izin pengiriman foto online dan tampilan hasil. Verifikasi pada Android serta backend akun/database mengikuti tracker integrasi.

Catatan operasional frontend berada di `AI_INTEGRATION.md` pada branch integrasi. Proxy lokal privat dapat diuji dengan flag demo; produksi membutuhkan sesi operator dari backend aplikasi. Penyimpanan yang diuji saat ini menggunakan repository demo lokal, sehingga belum membuktikan sinkronisasi database lintas perangkat.

## Atribusi

FFE v1 dibuat oleh Eko Prasetyo, Raden Dimas Adityo, Nanik Suciati dan Chastine Fatichah. Dataset digunakan di bawah CC BY 4.0, dengan perubahan crop, resize dan pemetaan label kesegaran untuk eksperimen model. [FFE dan DOI 10.17632/xzyx7pbr3w.1](https://data.mendeley.com/datasets/xzyx7pbr3w/1)

HansLab Fish Freshness Classification v10 digunakan di bawah CC BY 4.0. Versi sumber sudah berisi preprocessing dan augmentasi yang dicatat dalam README arsip. Pipeline ini memilih kelas insang, menelusuri keluarga sumber dan mengubah ukuran input. [Dataset HansLab](https://universe.roboflow.com/hanslab/fish-freshness-classification/dataset/10)

Pelatihan memakai Ultralytics YOLO11. Tinjau ketentuan perangkat lunak dan bobot pada saat mendistribusikan layanan/model. [Lisensi Ultralytics](https://www.ultralytics.com/license)
