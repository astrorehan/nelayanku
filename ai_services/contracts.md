# Kontrak layanan kesegaran v1

`POST /v1/freshness/predict` menerima multipart `image`, `part` (`eye`/`gill`) dan `species` (`kembung`/`tongkol`/`cakalang`). Satu request menilai satu crop persegi. JPEG dan PNG didukung, maksimal 5 MiB dan 1.280 piksel per sisi setelah orientasi. Crop minimal 64 piksel. Browser mengirim crop yang telah terorientasi.

Respons 200 memiliki `requestId`, `status`, `part`, `species`, `modelVersion`, `probabilities`, dan `reasonCodes`. Pada `ok`, mata menghasilkan `veryFresh/fresh/notFresh` dan insang `fresh/notFresh`. Probabilitas berjumlah satu. Pada `unassessable`, probabilitas null dan alasan berisi `unsupported_species`, `too_dark`, `glare`, `blurry`, `crop_too_small`, atau `low_confidence`.

Model klasifikasi memakai label dataset mata `very_fresh/fresh/not_fresh` dan insang `fresh/not_fresh`. Urutan output dibaca dari manifest. Manifest membedakan output logits dan probabilitas. Preprocessing RGB, bilinear 224×224, float32 [0,1], NCHW. Quality gate pada grayscale 160×160 memakai luminans Rec.709 dan varians Laplacian empat tetangga pada piksel interior. Ambang awal bersifat konfigurasi, perlu kalibrasi pada foto lokal.

`GET /healthz` memeriksa proses. `GET /readyz` memberi 503 jika bundle gagal dimuat dan 200 jika checksum, tensor serta dua model valid. Respons error memiliki `requestId/code/message`. Status 400 untuk gambar rusak, 413 untuk ukuran terlampaui, 415 untuk format, 422 untuk field/crop, 401 untuk kredensial, 429 untuk kapasitas dan 503 untuk model belum siap/timeout.

Layanan hanya mengembalikan probabilitas. Frontend menggabungkan hasil dengan bau dan tekstur melalui domain skor yang ada. Aktivasi spesies membutuhkan bukti evaluasi dan dicatat dalam `supportedSpecies`; daftar kosong mempertahankan penilaian manual.

Pada koneksi melalui backend, gunakan header `Authorization: Bearer <AI_SERVICE_TOKEN>`. Token disimpan di server. Runtime lokal diikat ke 127.0.0.1. Mode produksi wajib mengatur token. Foto sementara tidak disimpan atau dimasukkan ke log.
