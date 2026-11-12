# Kontrak layanan kesegaran v1

`POST /v1/freshness/predict` menerima multipart `image`, `part` (`eye`/`gill`) dan `species` (`kembung`/`tongkol`/`cakalang`). Satu request menilai satu crop persegi. JPEG dan PNG didukung, maksimal 5 MiB dan 1.280 piksel per sisi setelah orientasi. Crop minimal 64 piksel. Browser mengirim crop yang telah terorientasi.

Respons 200 memiliki `requestId`, `status`, `part`, `species`, `modelVersion`, `probabilities`, dan `reasonCodes`. Pada `ok`, mata menghasilkan `veryFresh/fresh/notFresh` dan insang `fresh/notFresh`. Probabilitas berjumlah satu. Pada `unassessable`, probabilitas null dan alasan berisi `unsupported_species`, `too_dark`, `glare`, `blurry`, `crop_too_small`, atau `low_confidence`.

Model klasifikasi memakai label dataset mata `very_fresh/fresh/not_fresh` dan insang `fresh/not_fresh`. Urutan output dibaca dari manifest. Manifest membedakan output logits dan probabilitas. Preprocessing RGB, bilinear 224×224, float32 [0,1], NCHW. Quality gate pada grayscale 160×160 memakai luminans Rec.709 dan varians Laplacian empat tetangga pada piksel interior. Ambang awal bersifat konfigurasi, perlu kalibrasi pada foto lokal.

`GET /healthz` memeriksa proses. `GET /readyz` memberi 503 jika bundle gagal dimuat dan 200 jika checksum, tensor serta dua model valid. Respons error memiliki `requestId/code/message`. Status 400 untuk gambar rusak, 413 untuk ukuran terlampaui, 415 untuk format, 422 untuk field/crop, 401 untuk kredensial, 429 untuk kapasitas dan 503 untuk model belum siap/timeout.

Layanan hanya mengembalikan probabilitas. Frontend menggabungkan hasil dengan bau dan tekstur melalui domain skor yang ada. Aktivasi spesies membutuhkan bukti evaluasi dan dicatat dalam `supportedSpecies`; daftar kosong mempertahankan penilaian manual.

Pada koneksi melalui backend, gunakan header `Authorization: Bearer <AI_SERVICE_TOKEN>`. Token disimpan di server. Runtime lokal diikat ke 127.0.0.1. Mode produksi wajib mengatur token. Foto sementara tidak disimpan atau dimasukkan ke log.

Contoh respons mata berikut bersifat ilustratif.

```json
{"requestId":"req-1","status":"ok","part":"eye","species":"kembung","modelVersion":"freshness-0.1.0","probabilities":{"veryFresh":0.8,"fresh":0.15,"notFresh":0.05},"reasonCodes":[]}
```

Contoh respons insang berikut bersifat ilustratif.

```json
{"requestId":"req-2","status":"ok","part":"gill","species":"kembung","modelVersion":"freshness-0.1.0","probabilities":{"fresh":0.9,"notFresh":0.1},"reasonCodes":[]}
```

Foto yang belum dapat dinilai memakai respons berikut.

```json
{"requestId":"req-3","status":"unassessable","part":"gill","species":"tongkol","modelVersion":"freshness-0.1.0","probabilities":null,"reasonCodes":["unsupported_species"]}
```

Contoh error ukuran berikut bersifat ilustratif.

```json
{"requestId":"req-4","code":"image_too_large","message":"Foto melebihi 5 MiB"}
```

P2 memakai `POST /v1/freshness/detect` dengan `image` foto utuh dan `species`. Batas format/ukuran sama, sedangkan bentuk foto boleh persegi panjang. Endpoint mengembalikan `parts.eye` dan `parts.gill` dengan struktur penilaian di atas ditambah `box` berupa `[x,y,width,height]` pada piksel foto asli setelah orientasi. Alasan deteksi meliputi `part_not_found` dan `ambiguous_target`. Jika bobot detektor tervalidasi belum tersedia, endpoint memberi 503 dan mengarahkan ke foto terpandu. `GET /readyz` menyertakan `detectorReady`.

Definisi preprocessing versi `rgb-bilinear-224-f32-nchw-v1` memakai koordinat pusat piksel, replikasi tepi, pembulatan `floor(value + 0.5)` ke uint8 dan tensor RGB float32 NCHW. Fixture `fixtures/preprocessing.json` mempunyai checksum tensor untuk membandingkan implementasi browser. Hasil quality gate mengonversi luminans ke float32 sebelum menghitung varians agar sesuai dengan buffer grayscale browser.
