import type { Metadata } from "next";
import { SignInPanel } from "@/components/auth/sign-in-panel";
import { PublicHeader } from "@/components/layout/public-header";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk dengan satu klik sebagai operator KUB, nelayan, pembeli, atau pengolah UMKM. Data demo sudah terisi.",
};

export default function SignInPage() {
  return (
    <>
      <PublicHeader ctaMode="always" />
      <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 pb-20 pt-10 sm:px-6 lg:pt-14">
        <div className="flex flex-col gap-3">
          <h1 className="type-title">Masuk sebagai siapa?</h1>
          <p className="type-lead text-ink-2">
            Akun demo berisi data simulasi KUB Sumber Jaya, Pulau Baai. Satu klik, langsung masuk.
          </p>
        </div>
        <SignInPanel />
      </main>
    </>
  );
}
