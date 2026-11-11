# Protokol data lokal dan syarat rilis

Audit dua arsip pengguna tersedia pada `reports/dataset-audit.json`. FFE mempunyai label hari penyimpanan per spesies. HansLab menyediakan kelas biner dan augmentasi, dengan identitas individu serta spesies yang belum diketahui. Eksperimen pada data sumber dipisahkan dari pembuktian penggunaan dermaga.

Untuk foto lokal, beri ikan ID unik sepanjang pengambilan. Rekam sesi/lot tangkap, spesies, waktu mendarat, waktu foto, penyimpanan/es, kamera dan pencahayaan. Foto mata dan insang, termasuk pengambilan berulang hari berikutnya, memakai ID yang sama. Catat nama penilai perikanan, metode penilaian dan keputusan label untuk setiap bagian.

Gunakan CSV dengan header berikut. Path mengacu ke file lokal dari root repository.

```csv
path,part,label,species,fish_id,group_id,group_verified,source,license,label_method
```

`part` adalah `eye` atau `gill`. Kelas mata `very_fresh`, `fresh`, `not_fresh`. Kelas insang `fresh`, `not_fresh`. Gunakan `group_verified=fish` atau `session` setelah identitas/kelompok diverifikasi, dan simpan semua foto yang saling berkaitan dalam satu kelompok split. Lisensi atau persetujuan pengambilan harus tercatat. Dataset lokal perlu mencakup kembung, tongkol dan cakalang dengan variasi HP, cahaya, sudut, es dan bagian yang tertutup. Buat himpunan salah bagian, tanpa ikan, buram, silau dan gelap untuk mengukur abstain.

Untuk detektor P2, sediakan foto ikan utuh dan anotasi kotak `eye` serta `gill` yang terlihat. Catat identitas ikan yang sama dengan dataset classifier. Simpan koordinat YOLO yang ternormalisasi dan tinjau kotak yang memotong objek, kosong, atau salah bagian. Catat kasus beberapa ikan sebagai target ambigu untuk fallback.

Sebelum test rilis, tim produk/perikanan menetapkan minimum ikan dan foto per kelas/spesies, precision/recall minimum, batas kesalahan ikan tidak segar menjadi segar, serta cakupan abstain yang diterima. Simpan nilai dan penanggung jawab persetujuan pada laporan evaluasi. Manifest `supportedSpecies` baru diisi setelah evaluasi lokal memenuhi kriteria tersebut dan paritas runtime terverifikasi. Target performa mengikuti PLAN.md. Model card menyatakan hasil sumber, hasil lokal, metode label, cakupan spesies, ukuran, latensi dan keterbatasan secara terpisah.
