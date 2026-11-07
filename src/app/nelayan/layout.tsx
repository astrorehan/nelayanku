import type { Metadata } from "next";
import { FisherShell } from "@/components/shells/role-shells";

export const metadata: Metadata = {
  title: { default: "Nelayan", template: "%s · Nelayan · Nelayanku" },
};

export default function FisherLayout({ children }: LayoutProps<"/nelayan">) {
  return <FisherShell>{children}</FisherShell>;
}
