import type { Metadata } from "next";
import { PermitPath } from "@/components/studio/permit-path";

export const metadata: Metadata = { title: "Jalur izin" };
export default function PermitPage() {
  return <PermitPath />;
}
