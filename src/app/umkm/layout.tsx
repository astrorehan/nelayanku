import type { Metadata } from "next";
import { ProducerShell } from "@/components/shells/role-shells";

export const metadata: Metadata = {
  title: { default: "Studio UMKM", template: "%s · Studio UMKM · Nelayanku" },
};

export default function ProducerLayout({ children }: LayoutProps<"/umkm">) {
  return <ProducerShell>{children}</ProducerShell>;
}
