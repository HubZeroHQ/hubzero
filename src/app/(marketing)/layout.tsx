import { MarketingShell } from "@/components/layout/marketing-shell";
import type { WithChildren } from "@/types";

export default function MarketingLayout({ children }: WithChildren) {
  return <MarketingShell>{children}</MarketingShell>;
}
