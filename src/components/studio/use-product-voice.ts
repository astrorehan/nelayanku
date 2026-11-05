"use client";

import { useEffect, useRef, useState } from "react";

interface SpeechSession {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult:
    | ((event: {
        results: ArrayLike<ArrayLike<{ transcript: string }>>;
      }) => void)
    | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechSession;
  webkitSpeechRecognition?: new () => SpeechSession;
};

export function useProductVoice(onTranscript: (text: string) => void) {
  const session = useRef<SpeechSession | null>(null);
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(
    () => () => {
      session.current?.abort();
    },
    [],
  );
  const toggle = () => {
    if (listening) {
      session.current?.stop();
      return;
    }
    const speechWindow = window as SpeechWindow;
    const Recognition =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setMessage(
        "Browser ini belum mendukung suara. Ketik keterangan produk di kolom yang sama.",
      );
      return;
    }
    const next = new Recognition();
    next.lang = "id-ID";
    next.continuous = false;
    next.interimResults = false;
    next.onresult = (event) => {
      onTranscript(
        Array.from(event.results, (result) => result[0].transcript).join(" "),
      );
      setMessage("Suara menjadi teks. Periksa dan sunting sebelum lanjut.");
    };
    next.onerror = (event) => {
      setListening(false);
      setMessage(
        event.error === "not-allowed"
          ? "Mikrofon tidak diizinkan. Tetap bisa ketik keterangan produk."
          : "Suara belum terbaca. Coba lagi atau ketik keterangan produk.",
      );
    };
    next.onend = () => setListening(false);
    session.current = next;
    try {
      next.start();
      setListening(true);
      setMessage("Sedang mendengarkan…");
    } catch {
      setListening(false);
      setMessage("Mikrofon belum bisa dipakai. Silakan ketik.");
    }
  };
  return { listening, message, toggle };
}
