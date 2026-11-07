import Link from "next/link";
import { Icon } from "@/components/icons/icon";
import { ButtonLink } from "@/components/ui/button";
import { FAQ_ITEMS } from "@/content/faq";

export function FaqPage() {
  return (
    <main
      id="main-content"
      className="mx-auto grid max-w-[84rem] gap-10 px-4 pb-20 pt-10 sm:px-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16 lg:pt-16"
    >
      <header className="flex flex-col gap-5 lg:sticky lg:top-28 lg:self-start">
        <p className="type-eyebrow">Tanya jawab</p>
        <h1 className="type-title">Pertanyaan yang paling sering diajukan</h1>
        <p className="type-lead text-ink-2">
          Jawabannya mengikuti apa yang benar-benar dilakukan demo ini, termasuk
          yang belum jalan.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          <ButtonLink href="/juri" icon="arrowRight" size="md">
            Ikuti panduan juri
          </ButtonLink>
          <ButtonLink href="/tentang" variant="secondary" size="md">
            Tentang Nelayanku
          </ButtonLink>
        </div>
      </header>

      <div className="flex flex-col border-b border-line">
        {FAQ_ITEMS.map((item, index) => (
          <details
            key={item.id}
            id={item.id}
            open={index === 0}
            className="group scroll-mt-28 border-t border-line"
          >
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 marker:hidden [&::-webkit-details-marker]:hidden">
              <h2 className="type-h3 min-w-0">{item.question}</h2>
              <Icon
                name="chevronDown"
                size={24}
                className="shrink-0 text-ink-2 transition-transform duration-150 group-open:rotate-180 group-open:text-sea"
              />
            </summary>
            <div className="flex max-w-2xl flex-col gap-3 pb-6 text-ink-2">
              {item.answer.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {item.links && (
                <p className="flex flex-wrap gap-x-5">
                  {item.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="inline-flex min-h-12 items-center gap-1.5 font-semibold text-sea hover:text-sea-deep"
                    >
                      {link.label}
                      <Icon name="arrowRight" size={18} />
                    </Link>
                  ))}
                </p>
              )}
            </div>
          </details>
        ))}
      </div>
    </main>
  );
}
