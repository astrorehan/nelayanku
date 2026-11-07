"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Logo } from "@/components/brand/logo";
import { Icon } from "@/components/icons/icon";
import { Button, ButtonLink } from "@/components/ui/button";
import { Sheet } from "@/components/ui/overlays";

const NAV_LINKS = [
  { href: "/juri", label: "Panduan juri" },
  { href: "/#cara-kerja", label: "Cara kerja" },
  { href: "/#siapa-membayar", label: "Siapa membayar" },
  { href: "/tentang/model", label: "Cara AI menilai" },
  { href: "/lacak", label: "Lacak kiriman" },
];

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

function useScrolledPast(offset: number) {
  return useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > offset,
    () => false,
  );
}

export function PublicHeader({ ctaMode = "always" }: { ctaMode?: "always" | "after-hero" | "never" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const onSignInPage = usePathname() === "/masuk";
  const scrolled = useScrolledPast(24);
  const pastHero = useScrolledPast(560);
  const showCta = ctaMode === "always" || (ctaMode === "after-hero" && pastHero);

  return (
    <header
      className={clsx(
        "sticky top-0 z-30 transition-[background-color,box-shadow,border-color] duration-200",
        scrolled ? "border-b border-line bg-surface/90 backdrop-blur-md" : "border-b border-transparent bg-surface",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[84rem] items-center gap-4 px-4 sm:px-6 lg:h-[4.75rem] lg:px-8">
        <Link href="/" className="-ml-1 shrink-0 p-1" aria-label="Nelayanku, halaman depan">
          <Logo className="h-6 w-auto lg:h-7" />
        </Link>
        <nav aria-label="Utama" className="ml-auto hidden items-center gap-0.5 xl:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-12 items-center rounded-full px-2.5 text-sm font-semibold text-ink-2 transition-colors hover:bg-paper hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 xl:flex">
          <div
            className={clsx(
              "transition-[opacity,transform] duration-200",
              showCta ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0",
            )}
            aria-hidden={!showCta}
          >
            <ButtonLink href="/coba" size="md" icon="eye" tabIndex={showCta ? undefined : -1}>
              Coba nilai ikan
            </ButtonLink>
          </div>
          {!onSignInPage && (
            <ButtonLink href="/masuk" variant="secondary" size="md">
              Masuk
            </ButtonLink>
          )}
        </div>
        <Button variant="ghost" size="md" icon="menu" className="ml-auto xl:hidden" onClick={() => setMenuOpen(true)}>
          Menu
        </Button>
      </div>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen} title="Menu">
        <nav aria-label="Utama di HP" className="flex flex-col gap-2 pb-2">
          <ButtonLink href="/coba" block icon="eye" onClick={() => setMenuOpen(false)}>
            Coba nilai kesegaran ikan
          </ButtonLink>
          <ButtonLink href="/masuk" variant="secondary" block onClick={() => setMenuOpen(false)}>
            Masuk sebagai…
          </ButtonLink>
          <div className="mt-2 flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-14 items-center justify-between border-b border-line text-lg font-semibold last:border-b-0 hover:text-sea"
              >
                {link.label}
                <Icon name="chevronRight" size={22} className="text-ink-2" />
              </Link>
            ))}
          </div>
        </nav>
      </Sheet>
    </header>
  );
}
