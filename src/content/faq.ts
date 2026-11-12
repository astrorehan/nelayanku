/**
 * Tanya jawab publik. Setiap jawaban mengikuti apa yang benar-benar dilakukan
 * kode di repositori ini (lihat scripts/build-offline.mjs, src/data/queries/tracking.ts)
 * dan docs/MODEL_BISNIS.md. Kalau perilaku aplikasi berubah, ubah teks di sini.
 */
export interface FaqLink {
  href: string;
  label: string;
}

export interface FaqItem {
  id: string;
  question: string;
  /** Satu jawaban pendek di baris pertama, rincian sesudahnya. */
  answer: readonly string[];
  links?: readonly FaqLink[];
}

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    id: "privasi-lacak",
    question: "Apa yang bisa dilihat orang lain lewat halaman lacak?",
    answer: [
      "Siapa pun yang punya kode atau QR kiriman bisa membuka halaman bukti mutu. Kode itu bukan rahasia, jadi anggap isinya terbuka.",
      "Yang tampil: jenis ikan, KUB dan pelabuhan asal, berat, kelas mutu dan skor, empat parameter penilaian, status es, serta jam pendaratan dan pengiriman.",
      "Yang tidak tampil: nama nelayan, nomor WhatsApp, harga, utang, dan catatan alasan. Nelayan hanya muncul sebagai nomor anggota, misalnya Nelayan #3.",
      "Tiap penilaian membawa cap sidik (hash audit) supaya perubahan setelah dinilai terlihat. Cap ini penanda perubahan, bukan tanda tangan resmi.",
    ],
    links: [{ href: "/lacak", label: "Coba lacak kiriman" }],
  },
  {
    id: "offline",
    question: "Bagaimana aplikasi tetap jalan tanpa sinyal?",
    answer: [
      "Dua hal bekerja bersama. Pertama, catatan Anda disimpan di penyimpanan browser pada perangkat ini, jadi mencatat dan menilai tidak menunggu internet. Kedua, sebuah service worker menyimpan halaman dan berkas aplikasi supaya bisa dibuka ulang saat sinyal hilang.",
      "Saat build, daftar halaman utama (depan, coba nilai, masuk, panduan juri, lacak, cara AI menilai, beranda tiap peran, dan beberapa halaman kerja operator dan pembeli) beserta gaya, skrip, huruf, foto contoh, dan gambar disiapkan untuk disimpan. Halaman lain, misalnya rincian satu kiriman, tersimpan setelah dibuka sekali dengan sinyal.",
      "Syaratnya: pakai versi production, buka aplikasi dengan sinyal sampai selesai dimuat, baru putus sinyal. Mode pengembangan tidak memasang service worker. Halaman yang belum pernah tersimpan akan menampilkan halaman offline.",
      "Batasnya: tidak ada antrean sinkron, karena memang belum ada server tujuan. Catatan tinggal di perangkat ini dan tidak muncul di perangkat lain. Kalau ruang simpan penuh atau ditolak, aplikasi memberi peringatan. Input suara bisa butuh internet, jadi selalu ada cadangan lewat teks.",
    ],
    links: [{ href: "/coba", label: "Buka alat nilai ikan" }],
  },
  {
    id: "masih-simulasi",
    question: "Kenapa semua ini masih simulasi?",
    answer: [
      "Karena yang selesai baru bagian yang tampil di layar. Backend, akun sungguhan, pembayaran, dan model terlatih belum dipasang, dan kami memilih menandainya terus terang daripada menutupinya.",
      "Simulasi: harga dan jam pada data contoh, pembayaran dan faktur, hasil penilaian untuk enam foto contoh (diambil dari kelas dataset, bukan dari prediksi model), serta label yang disusun dari templat. Teks jualan di Studio memakai model bahasa (Claude Haiku) lewat server, dan kembali ke templat bila tidak ada sinyal atau layanan AI tidak tersedia.",
      "Foto yang Anda unggah sendiri tidak mendapat prediksi AI. Mata dan insangnya dinilai manual, dan foto tidak dikirim ke server mana pun.",
      "Bukan simulasi: angka masalah di halaman Tentang, yang berasal dari penelitian dengan sumber tercantum, dan foto contoh yang berlisensi terbuka. Akurasi model belum pernah diukur, jadi kami tidak menampilkan angka akurasi apa pun.",
    ],
    links: [
      { href: "/tentang/model", label: "Cara AI menilai" },
      { href: "/tentang", label: "Batas demo" },
    ],
  },
  {
    id: "sni-dan-sertifikat",
    question: "Apa bedanya skor mutu di sini dengan sertifikat SNI?",
    answer: [
      "SNI 2729 untuk ikan segar menilai enam parameter sensori dengan skala 1 sampai 9: mata, insang, lendir permukaan, daging, bau, dan tekstur. Nilai minimal untuk dinyatakan layak adalah 7.",
      "Nelayanku memakai rumus bergaya SNI, tetapi hanya empat parameter: mata, insang, bau, dan tekstur. Lendir dan daging belum dinilai. Bobot dan batas kelas A, B, C adalah aturan proyek yang masih perlu divalidasi ahli perikanan.",
      "Jadi skor ini membantu operator membaca mutu dan membuktikan catatannya. Skor bukan sertifikat SNI, bukan uji laboratorium, dan bukan jaminan keamanan pangan. Untuk keperluan resmi, tetap rujuk lembaga yang berwenang.",
    ],
    links: [{ href: "/tentang/model", label: "Rumus dan batasnya" }],
  },
  {
    id: "siapa-membayar",
    question: "Siapa yang membayar, dan nelayan harus bayar apa?",
    answer: [
      "Nelayan dan pengolah UMKM tidak membayar apa pun. Pembayarnya pembeli dan KUB.",
      "Pembeli swasta (restoran, hotel, katering) rencananya dikenai biaya layanan 2% yang sudah termasuk dalam harga. Dapur SPPG Rp0, karena Peraturan BGN Nomor 10 Tahun 2026 melarang komisi dalam pengadaan. KUB atau koperasi rencananya berlangganan paket Pro, dengan perkiraan awal sekitar Rp99.000 per bulan. Program pemerintah atau CSR bisa membiayai pemasangan per desa.",
      "Semua angka biaya itu asumsi dari rencana bisnis dan belum diuji ke pembeli maupun KUB. Di demo tidak ada uang sungguhan yang berpindah.",
      "Nelayanku tidak meminjamkan uang. Buku kas hanya mencatat utang yang sudah ada, dan pembiayaan tetap lewat lembaga resmi.",
    ],
    links: [{ href: "/#siapa-membayar", label: "Ringkasan di halaman depan" }],
  },
  {
    id: "data-di-browser",
    question: "Di mana data yang saya catat disimpan?",
    answer: [
      "Hanya di browser perangkat ini. Demo tidak punya server untuk menampung data, jadi catatan, foto bukti, dan draf tidak dikirim ke mana pun.",
      "Akibatnya, kiriman baru yang Anda buat hanya terlihat di browser yang sama. Perangkat lain hanya melihat data contoh bawaan.",
      "Menu Demo di dalam aplikasi, atau tombol di halaman Masuk, mengembalikan semua data ke keadaan awal.",
    ],
    links: [{ href: "/masuk", label: "Ke halaman Masuk" }],
  },
];
