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
        scrolled ? "border-b border-line bg-paper/92 backdrop-blur-md" : "border-b border-transparent bg-paper",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[76rem] items-center gap-4 px-4 sm:px-6 lg:h-[4.5rem] lg:px-8">
        <Link href="/" className="-ml-1 shrink-0 rounded-[10px] p-1" aria-label="Nelayanku, halaman depan">
          <Logo className="h-7 w-auto lg:h-8" />
        </Link>
        <nav aria-label="Utama" className="ml-6 hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[10px] px-3 py-2 font-semibold text-ink-2 transition-colors hover:bg-paper-deep hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 lg:flex">
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
            <ButtonLink href="/masuk" variant="quiet" size="md">
              Masuk
            </ButtonLink>
          )}
        </div>
        <Button variant="quiet" size="md" icon="menu" className="ml-auto lg:hidden" onClick={() => setMenuOpen(true)}>
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
                className="flex min-h-14 items-center justify-between border-b border-line text-lg font-semibold last:border-b-0"
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
