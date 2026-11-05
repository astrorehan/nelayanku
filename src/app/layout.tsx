import type { Metadata, Viewport } from "next";
import { OfflineSupport } from "@/components/offline/offline-support";
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
    <html
      lang="id"
      className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable}`}
    >
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[8px] focus:bg-ink focus:p-4 focus:text-paper"
        >
          Lewati ke isi halaman
        </a>
        <noscript>
          <style>
            {"[data-reveal]{opacity:1!important;transform:none!important}"}
          </style>
        </noscript>
        <DemoDataProvider>
          <OfflineSupport />
          {children}
        </DemoDataProvider>
      </body>
    </html>
  );
}
