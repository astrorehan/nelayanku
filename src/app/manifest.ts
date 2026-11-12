import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nelayanku",
    short_name: "Nelayanku",
    description: "Nilai kesegaran ikan di dermaga, isi pesanan, dan bagi hasil yang adil untuk KUB nelayan kecil.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF8F3",
    theme_color: "#13283A",
    lang: "id",
    icons: [
      { src: "/brand/app-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/app-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/app-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
