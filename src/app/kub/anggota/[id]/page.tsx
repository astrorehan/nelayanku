import type { Metadata } from "next";
import { MemberProfileView } from "@/components/operator/member-profile-view";

export const metadata: Metadata = { title: "Profil anggota" };

export default async function MemberPage({ params }: PageProps<"/kub/anggota/[id]">) {
  const { id } = await params;
  return <MemberProfileView fisherId={decodeURIComponent(id)} />;
}
