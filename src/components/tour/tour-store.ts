"use client";

import { useSyncExternalStore } from "react";
import { TOUR_STEPS } from "./tour-steps";

export const TOUR_STORAGE_KEY = "nelayanku.tour";
let step: number | null = null;
let loaded = false;
const listeners = new Set<() => void>();

function readStep(): number | null {
  try {
    const value = JSON.parse(localStorage.getItem(TOUR_STORAGE_KEY) ?? "null");
    if (value?.version === 1 && Number.isInteger(value.step) && value.step >= 0 && value.step < TOUR_STEPS.length)
      return value.step;
  } catch {
    // Tur tetap dapat dipakai selama halaman terbuka saat penyimpanan ditolak.
  }
  return null;
}

function refresh(event: StorageEvent) {
  if (event.key === TOUR_STORAGE_KEY || event.key === null) {
    step = readStep();
    listeners.forEach((listener) => listener());
  }
}

function subscribe(listener: () => void) {
  if (!loaded) {
    step = readStep();
    loaded = true;
  }
  if (!listeners.size) window.addEventListener("storage", refresh);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener("storage", refresh);
  };
}

export function setTourStep(next: number | null) {
  step = next;
  loaded = true;
  try {
    if (next === null) localStorage.removeItem(TOUR_STORAGE_KEY);
    else localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify({ version: 1, step: next }));
  } catch {
    // Status dalam memori tetap berubah walaupun localStorage penuh/ditolak.
  }
  listeners.forEach((listener) => listener());
}

export function useTourStep() {
  return useSyncExternalStore(subscribe, () => step, () => null);
}
