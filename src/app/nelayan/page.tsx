import type { Metadata } from "next";
import { FisherView } from "@/components/fisher/fisher-view";

export const metadata: Metadata = { title: "Nelayan" };

export default function FisherPage() {
  return <FisherView />;
}
