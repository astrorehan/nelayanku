import type { ReactNode } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/icons/icon";
import { ButtonLink } from "@/components/ui/button";
import { Avatar, Notice, SimulatedTag } from "@/components/ui/surface";
import {
  PORT_AUCTION_TONGKOL_PRICE,
  RETAIL_TONGKOL_PRICE,
} from "@/content/market-facts";
import { formatRupiah } from "@/lib/format";

interface ProblemFact {
  figure: string;
  text: string;
  source: string;
}

const PROBLEMS: readonly ProblemFact[] = [
  {
    figure: "90%",
    text: "nelayan di Kota Bani, Bengkulu Utara, menjual ke toke dan menerima harga apa adanya.",
    source: "Mujagri, 2023. Survei 20 nelayan.",
  },
  {
    figure: "±43%",
    text: `bagian nelayan dari harga tongkol di pengecer: ${formatRupiah(PORT_AUCTION_TONGKOL_PRICE.value)}/kg di TPI Pulau Baai, ${formatRupiah(RETAIL_TONGKOL_PRICE.value)}/kg di pengecer.`,
    source: `${PORT_AUCTION_TONGKOL_PRICE.source}. Hitungan penulis dari 12 pedagang.`,
  },
  {
    figure: "77,42%",
    text: "nelayan di Seluma berutang, dan 96,77% bergantung pada tengkulak atau pengepul.",
    source: "Agribis Unived, Januari 2026. Survei 62 nelayan.",
  },
  {
    figure: "85%",
    text: "nelayan Kota Bani tidak punya cool box, sehingga ikan harus segera dijual berapa pun harganya.",
    source: "Mujagri, 2023. Survei 20 nelayan.",
  },
];

const STEPS: ReadonlyArray<{ icon: IconName; title: string; text: string }> = [
  {
    icon: "eye",
    title: "Nilai di dermaga",
    text: "Mata dan insang difoto, bau dan tekstur dipilih dengan dua ketukan. Hasilnya skor bergaya SNI 2729 dan satu kelas mutu. Tetap jalan tanpa sinyal.",
  },
  {
    icon: "crate",
    title: "Pesanan dulu, baru tangkap",
    text: "Pembeli institusi memesan sehari sebelumnya. KUB mengisi pesanan itu dari tangkapan anggota keesokan paginya.",
  },
  {
    icon: "coins",
    title: "Harga dan uang terbuka",
    text: "Setiap rupiah punya rincian. Bagi hasil dihitung per nelayan, dan utang dicatat terbuka lalu disetujui nelayan.",
  },
  {
    icon: "jar",
    title: "Ikan mutu rendah tetap berguna",
    text: "Ikan kelas C jadi bahan olahan. Studio membantu menghitung harga pokok dan menyusun label untuk pengolah UMKM.",
  },
  {
    icon: "qr",
    title: "Bukti mutu bisa dilacak",
    text: "Setiap kiriman punya halaman publik yang bisa dibuka dari QR, tanpa membuka identitas nelayan.",
  },
];

const TEAM = [
  { initials: "MR", name: "Muhammad Raihan Surya", role: "Fullstack" },
  { initials: "MC", name: "Muhammad Choirudin Ammar", role: "AI Engineer" },
  { initials: "AR", name: "Ahmad Rafi Firdaus", role: "Produk & Validasi" },
] as const;

const DATA_SOURCES: ReadonlyArray<{
  name: string;
  detail: string;
  status: string;
  href: string;
}> = [
  {
    name: "Freshness of the Fish Eyes (FFE), Mendeley Data",
    detail: "CC BY 4.0. Enam foto mata kembung dari dataset ini dipotong persegi dan dipakai sebagai foto contoh.",
    status: "Dipakai",
    href: "https://data.mendeley.com/datasets/xzyx7pbr3w",
  },
  {
    name: "Fish Freshness Classification, Roboflow Universe",
    detail: "CC BY 4.0. Rencana untuk melatih penilaian mata dan insang.",
    status: "Rencana, belum dipakai",
    href: "https://universe.roboflow.com/hanslab/fish-freshness-classification",
  },
  {
    name: "Agribis UMB, Juli 2026",
    detail: "Rantai harga tongkol Pulau Baai: nelayan, TPI, pengumpul, pengecer.",
    status: "Angka masalah",
    href: "https://jurnal.umb.ac.id/index.php/agribis/article/view/10786",
  },
  {
    name: "Mujagri, 2023",
    detail: "Perilaku jual dan cool box nelayan Kota Bani, Bengkulu Utara.",
    status: "Angka masalah",
    href: "https://ejournal.unmus.ac.id/index.php/agri/article/download/5300/2956",
  },
  {
    name: "Agribis Unived, Januari 2026",
    detail: "Utang dan ketergantungan pada tengkulak nelayan Seluma.",
    status: "Angka masalah",
    href: "https://jurnal.umb.ac.id/index.php/agribis/article/view/9851",
  },
];

const LIMITS = [
  "Semua harga, jam, dan pembayaran adalah simulasi.",
  "Penilaian enam foto contoh disimulasikan dari kelas dataset. Belum ada model terlatih dan akurasinya belum diukur.",
  "Foto yang diunggah tidak dinilai AI. Mata dan insangnya dinilai manual.",
  "Data tersimpan di browser perangkat ini. Tidak ada server, akun produksi, atau sinkronisasi antarperangkat.",
  "Label dan teks jualan memakai templat, bukan model bahasa. Nomor izin tidak dibuat otomatis.",
  "Skor mutu bukan sertifikat SNI, uji laboratorium, atau jaminan keamanan pangan.",
];

function Section({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="grid gap-6 border-t border-line py-12 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-16 lg:py-16"
    >
      <div className="flex flex-col gap-3">
        <h2 id={id} className="type-h1">
          {title}
        </h2>
        {intro && <p className="text-ink-2">{intro}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export function AboutPage() {
  return (
    <main
      id="main-content"
      className="mx-auto max-w-[84rem] px-4 pb-20 pt-10 sm:px-8 lg:pt-16"
    >
      <header className="flex max-w-3xl flex-col gap-5 pb-12 lg:pb-16">
        <p className="type-eyebrow">Tentang Nelayanku</p>
        <h1 className="type-title">
          Ikan nelayan kecil, mutu terukur, dibayar adil
        </h1>
        <p className="type-lead text-ink-2">
          Sistem kerja untuk KUB dan koperasi nelayan kecil di Pulau Baai,
          Bengkulu. Dibuat untuk IT RUSH 2026 (Web Development), Universitas
          Bengkulu, subtema Ekonomi dan Pemberdayaan Masyarakat.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <ButtonLink href="/juri" icon="arrowRight" size="md">
            Ikuti panduan juri
          </ButtonLink>
          <ButtonLink href="/tentang/model" variant="secondary" size="md">
            Cara AI menilai
          </ButtonLink>
        </div>
      </header>

      <Section
        id="masalah"
        title="Masalahnya"
        intro="Angka di samping berasal dari penelitian kecil di Bengkulu. Ia menggambarkan daerah itu, bukan seluruh Indonesia."
      >
        <dl className="flex flex-col">
          {PROBLEMS.map((fact) => (
            <div
              key={fact.figure}
              className="grid gap-1 border-t border-line py-5 first:border-t-0 first:pt-0 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6"
            >
              <dt className="type-figure-stat text-sea">{fact.figure}</dt>
              <dd className="flex flex-col gap-1">
                <span>{fact.text}</span>
                <span className="type-small">{fact.source}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section
        id="solusi"
        title="Yang kami bangun"
        intro="AI menyarankan, manusia memutuskan. Skor dan harga selalu bisa ditolak atau diubah."
      >
        <ol className="flex flex-col">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-4 border-t border-line py-5 first:border-t-0 first:pt-0"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-sky-tint text-sea-deep">
                <Icon name={step.icon} size={26} />
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <h3 className="type-h3">
                  <span className="text-ink-3">{index + 1}. </span>
                  {step.title}
                </h3>
                <p className="text-ink-2">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 flex flex-wrap gap-x-6">
          <InlineLink href="/tentang/model">Cara AI menilai dan batasnya</InlineLink>
          <InlineLink href="/coba">Coba nilai satu foto</InlineLink>
        </p>
      </Section>

      <Section id="tim" title="Tim">
        <ul className="grid gap-x-8 sm:grid-cols-2 xl:grid-cols-3">
          {TEAM.map((member) => (
            <li
              key={member.name}
              className="flex items-center gap-4 border-t border-line py-4 first:border-t-0 sm:border-t-0 sm:py-3"
            >
              <Avatar initials={member.initials} size="lg" />
              <div className="min-w-0">
                <p className="type-h3 break-words">{member.name}</p>
                <p className="text-ink-2">{member.role}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="type-small mt-4">
          Nama pengguna dalam cerita demo (Bu Sari, Pak Darman, Pak Hendra, Bu
          Yanti) adalah tokoh rekaan.
        </p>
      </Section>

      <Section
        id="sumber"
        title="Sumber data"
        intro="Angka masalah hanya diambil dari riset yang tercatat di repositori, lengkap dengan sumbernya."
      >
        <ul className="flex flex-col">
          {DATA_SOURCES.map((source) => (
            <li
              key={source.name}
              className="flex flex-col gap-1 border-t border-line py-4 first:border-t-0 first:pt-0"
            >
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <a
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center gap-1.5 font-semibold text-sea hover:text-sea-deep sm:min-h-0"
                >
                  {source.name}
                  <Icon name="external" size={16} />
                </a>
                <span className="type-small rounded-full border border-line px-2.5 py-0.5">
                  {source.status}
                </span>
              </p>
              <p className="text-ink-2">{source.detail}</p>
            </li>
          ))}
        </ul>
        <p className="type-small mt-4 flex flex-wrap items-center gap-2">
          Harga yang muncul di aplikasi adalah data contoh <SimulatedTag />, bukan
          harga pasar hari ini.
        </p>
      </Section>

      <Section id="batas" title="Batas demo">
        <Notice tone="warning" title="Ini frontend demo, bukan layanan yang sudah berjalan">
          <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5">
            {LIMITS.map((limit) => (
              <li key={limit}>{limit}</li>
            ))}
          </ul>
        </Notice>
        <p className="mt-4">
          <InlineLink href="/faq">Baca tanya jawab selengkapnya</InlineLink>
        </p>
      </Section>
    </main>
  );
}

function InlineLink({ href, children }: { href: "/faq" | "/coba" | "/tentang/model"; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-12 items-center gap-1.5 font-semibold text-sea hover:text-sea-deep"
    >
      {children}
      <Icon name="arrowRight" size={18} />
    </Link>
  );
}
