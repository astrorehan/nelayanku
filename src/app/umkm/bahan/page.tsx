import type { Metadata } from "next";
import { MaterialList } from "@/components/studio/material-list";

export const metadata: Metadata = { title: "Bahan baku" };
export default function MaterialPage() {
  return <MaterialList />;
}
