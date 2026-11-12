import type { Metadata } from "next";
import { Suspense } from "react";
import { CatchWizard, WizardLoading } from "@/components/catch-wizard/catch-wizard";

export const metadata: Metadata = { title: "Catat pendaratan" };

export default function CatchLandingPage() {
  return (
    <Suspense fallback={<WizardLoading />}>
      <CatchWizard />
    </Suspense>
  );
}
