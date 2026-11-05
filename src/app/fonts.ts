import { Atkinson_Hyperlegible_Mono, Atkinson_Hyperlegible_Next } from "next/font/google";

export const bodyFont = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"],
});

export const displayFont = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"],
});

export const monoFont = Atkinson_Hyperlegible_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["ui-monospace", "Menlo", "Consolas", "monospace"],
});
