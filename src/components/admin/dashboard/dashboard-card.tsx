import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Surface, Text } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface DashboardCardProps {
  title: string;
  icon?: LucideIcon;
  /** Real content — a stat, a list, or an `<EmptyState>` when there's genuinely nothing yet. */
  children: ReactNode;
  className?: string;
}

/**
 * The one dashboard-card primitive (`ARCHITECTURE/19_CMS_FOUNDATION.md` §10) —
 * deliberately just a titled frame. It has no opinion on whether its content
 * is a number, a list, or an empty state; that discipline (real data or an
 * honest "nothing yet," never a placeholder chart) lives in what each caller
 * puts inside it, not in this component.
 */
export function DashboardCard({ title, icon: Icon, children, className }: DashboardCardProps) {
  return (
    <Surface padding="lg" className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="text-text-muted size-4 shrink-0" aria-hidden="true" />}
        <Text size="caption" weight="medium" tone="muted" className="tracking-wide uppercase">
          {title}
        </Text>
      </div>
      {children}
    </Surface>
  );
}
