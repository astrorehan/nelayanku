import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NELAYANKU",
  description:
    "Ikan nelayan kecil, mutu terukur, dibayar adil, tanpa ada yang terbuang.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
