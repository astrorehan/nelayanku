import type { Metadata } from "next";
import { FisherHome } from "@/components/fisher/fisher-home";

export const metadata: Metadata = { title: "Hari ini" };

export default function FisherPage() {
  return <FisherHome />;
}
