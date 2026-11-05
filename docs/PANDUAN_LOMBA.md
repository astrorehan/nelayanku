# Panduan Lomba — IT RUSH 2026, Cabang Web Development

Ringkasan semua aturan yang mengikat, diambil dari tiga dokumen resmi panitia: Guidebook Web Dev IT RUSH 2026, Template Proposal Web Development, dan Template Surat Pernyataan Orisinalitas. Dicek 4 November 2026.

---

## 1. Tanggal penting

| Tanggal | Agenda |
| :-- | :-- |
| 24 Okt – 6 Nov 2026 | Pendaftaran & pengumpulan karya Gelombang 1 (Rp50.000/tim) |
| 7 – 20 Nov 2026 | Pendaftaran & pengumpulan karya Gelombang 2 (Rp75.000/tim) |
| **20 Nov 2026, 23.59 WIB** | **Batas akhir pengumpulan karya** |
| 28 – 29 Nov 2026 | Penilaian dan penjurian (daring, asinkron) |
| 30 Nov 2026 | Pengumuman pemenang. Website harus tetap aktif sampai tanggal ini. |

Kalau ingin harga Gelombang 1, tanyakan dulu ke CP (Alfarian 0896-3195-1572, Ihsan 0831-2866-7919) apakah pendaftar Gelombang 1 masih boleh mengumpulkan karya sampai 20 Nov.

## 2. Syarat peserta

- Mahasiswa aktif S1/sederajat (scan KTM). Tim 2–4 orang (atau individu), boleh beda kampus, satu orang jadi ketua.
- Follow Instagram @it.rush2026 dan @himatif.unib. Unggah Twibbon resmi (https://bit.ly/4sldhoB).
- Satu orang hanya boleh di satu tim, dan satu tim hanya mengirim satu karya.
- Satu tim memilih **satu subtema**. Untuk proyek ini: **3. Ekonomi dan Pemberdayaan Masyarakat**.

## 3. Syarat karya

| Aturan | Isi | Dampaknya untuk kita |
| :-- | :-- | :-- |
| V.1 | Aplikasi web sesuai tema dan subtema, **wajib mengintegrasikan AI** di fiturnya | AI ada di grading kesegaran, rekomendasi harga, dan Studio UMKM |
| V.2 | **Di-deploy dan bisa diakses publik**, tetap aktif sampai 30 Nov | Vercel + Supabase. Pasang keep-alive (lihat bagian 7) |
| V.3 | Source code di GitHub/GitLab **publik**. **Riwayat commit tidak boleh dihapus atau dimanipulasi.** | Jangan squash, rebase, atau force-push di `main`. |
| V.4 | Tech stack bebas | — |
| V.5 | Template, library, aset open-source, dan AI coding assistant **boleh**, tapi **wajib dicantumkan** di proposal dan README | Isi daftar ini sebelum submit (lihat checklist bagian 6) |
| V.6 | Kalau ada login, **akun demo** (username + password) wajib dicantumkan di proposal | Siapkan satu akun per peran |
| V.7 | Tidak boleh memuat SARA, pornografi, perjudian, malware, atau konten melanggar hukum | — |
| V.8 | Hak cipta tetap milik peserta. Panitia boleh menampilkan nama karya, screenshot, dan video. | — |

## 4. Aturan orisinalitas (paling ketat)

- Guidebook IV.7: karya orisinal, **belum pernah menjuarai** lomba lain, dan **tidak sedang diikutkan** di lomba lain.
- Guidebook IV.8: dilarang menyalin atau meng-clone proyek pihak lain. Kalau terbukti plagiat, tim didiskualifikasi.
- **Surat Pernyataan Orisinalitas (lebih ketat):** karya harus "benar-benar hasil karya asli tim kami dan **belum pernah dipublikasikan atau diikutsertakan dalam kompetisi lain sebelumnya**", serta tidak sedang atau akan diikutkan di lomba sejenis selama seleksi IT RUSH.

**Akibatnya:** NELAYANKU ditulis sebagai kode baru dari nol. Jangan menyalin file dari proyek lain yang pernah dipublikasikan atau diikutkan lomba.

## 5. Surat pernyataan: bagian AI

Surat wajib memilih salah satu:

- ☐ Tidak menggunakan AI.
- ☐ Menggunakan AI sebagai alat bantu (brainstorming, tata bahasa, debugging) dan/atau Cloud AI/API pihak ketiga sebagai komponen fungsional. Pilihan ini menyatakan bahwa **seluruh gagasan, isi, arsitektur sistem, integrasi, prompting, dan kustomisasinya adalah rancangan mandiri tim, dan seluruh keluaran AI sudah ditinjau dan diverifikasi tim.**

Lalu isi tabel: **No. | Nama Aplikasi AI/API | Fungsi/Bagian Karya yang Didukung | Kustomisasi/Pengaturan**. Surat ditandatangani ketua tim di atas materai Rp10.000.

Karena pernyataan ini ditandatangani, **semua dokumen di repo ini harus dibaca, disunting, dan disetujui tim** sebelum dipakai di proposal.

## 6. Berkas yang dikumpulkan (Google Form)

- **Bagian A:** scan KTM seluruh anggota.
- **Bagian B:** bukti bayar, bukti follow Instagram, bukti unggah Twibbon.
- **Bagian C:**
  - [ ] Link live website (publik)
  - [ ] Link repository (publik)
  - [ ] Link video demo **3–5 menit**, YouTube Unlisted. Isi: perkenalan, latar belakang & solusi, demo website dan penjelasan fiturnya.
  - [ ] Proposal PDF, nama file `ITRUSH26_NamaTim_JudulKarya.pdf`, mengikuti template
  - [ ] Surat Pernyataan Orisinalitas dan AI (PDF)

Link formulir pendaftaran: https://bit.ly/4yF5IuC · Pengumpulan karya: https://bit.ly/4elms2A

## 7. Cara juri menilai

- **Daring dan asinkron, tanpa presentasi.** Juri mencoba live website sendiri, memeriksa source code, lalu menilai video dan proposal.
- Hanya karya lengkap yang masuk sebelum batas waktu yang dinilai.

| Kriteria | Bobot |
| :-- | --: |
| Fungsionalitas dan Kualitas Teknis Website | 25% |
| Inovasi dan Ketepatan Solusi | 20% |
| Relevansi Tema dan Dampak | 15% |
| Desain Antarmuka (UI) dan Pengalaman Pengguna (UX) | 15% |
| Kualitas Source Code | 15% |
| Dokumentasi Karya (Proposal, Video Demo, README) | 10% |

**Supaya website tetap hidup 20–30 Nov:** proyek Supabase gratis di-pause setelah 7 hari sepi, dan HF Spaces gratis tidur setelah 48 jam tidak aktif. Pasang GitHub Actions cron harian yang memanggil database dan endpoint AI.

## 8. Struktur proposal (template resmi) dan sumber isinya

| Bagian proposal | Isi menurut template | Ambil dari |
| :-- | :-- | :-- |
| Sampul | Judul karya, logo website, nama tim + NIM, "Web Development IT RUSH, Program Studi Informatika, Universitas Bengkulu, 2026" | — |
| Kata Pengantar, Daftar Isi | — | — |
| 1.1 Latar Belakang | Latar belakang pembuatan website | `RISET.md` (angka nasional + Bengkulu) |
| 1.2 Rumusan Masalah | Poin-poin masalah dari latar belakang | `PRD.md` §2 |
| 1.3 Tujuan | Manfaat website dari ide yang diangkat | `PRD.md` §3 |
| 1.4 Manfaat | Manfaat keberlanjutan | `MODEL_BISNIS.md` (dampak) |
| 2.1 Deskripsi Website | Konsep dan fungsi utama | `PRD.md` §3 |
| **2.2 Unique Selling Point** | Keunggulan dibanding kompetitor, kenapa unik dan layak dipakai | `EVALUASI.md` (pemain yang ada), `MODEL_BISNIS.md` |
| **2.3 Target Market dan Pengguna** | Segmentasi pasar sasaran | `MODEL_BISNIS.md` |
| **2.4 Potensi Pengembangan dan Monetisasi** | Cara menghasilkan keuntungan (B2C/B2B; freemium, langganan, kemitraan) | `MODEL_BISNIS.md` |
| 2.5 Metode Pembuatan | Metode, tools, teknologi | `PRD.md` (arsitektur), daftar library + AI tools (aturan V.5) |
| 3.1 Fitur Website | Fitur utama dan fungsinya | `PRD.md` §6 |
| 3.2 Arsitektur Sistem & User Flow | Arsitektur dan alur pengguna | `PRD.md` §5 dan §8 |
| 3.3 Wireframe | Desain low-fidelity | Dibuat tim |
| 3.4 Tampilan UI | Mockup/high-fidelity (screenshot app asli) | Screenshot dari website |
| 4.1 Kesimpulan, 4.2 Saran | Rangkuman dan pengembangan ke depan | `MODEL_BISNIS.md` (roadmap) |
| Daftar Pustaka | Semua rujukan | `RISET.md` (semua URL sudah dikumpulkan) |
| Lampiran (opsional) | Akun demo, link video, bukti validasi | `PRD.md` §12, `MODEL_BISNIS.md` (validasi) |
