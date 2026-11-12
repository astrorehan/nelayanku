import type { Metadata } from "next";
import { BuyerShell } from "@/components/shells/role-shells";

export const metadata: Metadata = {
  title: { default: "Pembeli", template: "%s · Pembeli · Nelayanku" },
};

export default function BuyerLayout({ children }: LayoutProps<"/pembeli">) {
  return <BuyerShell>{children}</BuyerShell>;
}
