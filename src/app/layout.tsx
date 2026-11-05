import type { Metadata, Viewport } from "next";
import { DemoDataProvider } from "@/data/demo-data-provider";
import { bodyFont, displayFont, monoFont } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nelayanku · Ikan nelayan kecil, mutu terbukti, dibayar adil",
    template: "%s · Nelayanku",
  },
  description:
    "Sistem kerja digital untuk KUB nelayan kecil: nilai kesegaran ikan di dermaga, isi pesanan dapur SPPG dan restoran, dan bagi hasil yang adil.",
};

export const viewport: Viewport = {
  themeColor: "#13283A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable}`}>
      <body>
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
        <DemoDataProvider>{children}</DemoDataProvider>
      </body>
    </html>
  );
}
