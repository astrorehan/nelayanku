import type { Metadata } from "next";
import { ModelExplainer } from "@/components/model/model-explainer";

export const metadata: Metadata = {
  title: "Cara model menilai dan batasannya",
};

export default function ModelPage() {
  return (
    <main
      id="main-content"
      className="mx-auto flex max-w-4xl flex-col gap-12 px-4 py-10 sm:px-6 sm:py-16"
    >
      <ModelExplainer />
    </main>
  );
}
