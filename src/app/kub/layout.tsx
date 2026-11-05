import type { Metadata } from "next";
import { OperatorShell } from "@/components/operator/operator-shell";

export const metadata: Metadata = {
  title: { default: "Operator KUB", template: "%s · Operator KUB · Nelayanku" },
};

export default function OperatorLayout({ children }: LayoutProps<"/kub">) {
  return <OperatorShell>{children}</OperatorShell>;
}
