import Link from "next/link";
import { SITE_MAP } from "@/content/site-map";

export function SiteMap() {
  return (
    <nav aria-label="Peta situs" className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
      {SITE_MAP.map((group) => (
        <div key={group.id}>
          <p className="type-eyebrow mb-1">{group.title}</p>
          <ul>
            {group.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex min-h-12 items-center text-[0.9375rem] font-semibold leading-snug hover:text-sea sm:min-h-10"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
