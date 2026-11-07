import type { Metadata } from "next";
import { MembersView } from "@/components/operator/members-view";

export const metadata: Metadata = { title: "Anggota" };

export default function MembersPage() {
  return <MembersView />;
}
