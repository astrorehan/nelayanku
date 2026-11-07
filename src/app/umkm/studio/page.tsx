import type { Metadata } from "next";
import { Suspense } from "react";
import { RolePage } from "@/components/layout/role-shell";
import { StudioView } from "@/components/studio/studio-view";

export const metadata: Metadata = { title: "Studio olahan" };
export default function StudioPage() {
  return (
    <Suspense
      fallback={
        <RolePage>
          <p className="text-ink-2">Membuka studio…</p>
        </RolePage>
      }
    >
      <StudioView />
    </Suspense>
  );
}
