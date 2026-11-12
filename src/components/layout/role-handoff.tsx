import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons/icon";

export function RoleHandoff({ href, icon, children }: { href: string; icon: IconName; children: ReactNode }) {
  return (
    <Link href={href} className="group inline-flex min-h-12 items-center gap-2.5 self-start py-2 font-semibold text-sea-deep underline decoration-sea/30 underline-offset-4 hover:decoration-sea">
      <Icon name={icon} size={22} className="shrink-0" />
      <span className="min-w-0">{children}</span>
      <Icon name="arrowRight" size={18} className="shrink-0 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
    </Link>
  );
}
