import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends ComponentPropsWithoutRef<"div"> {
  icon?: ReactNode;
  title: string;
  description?: string;
  /** e.g. a <Button> */
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 py-16 text-center", className)} {...props}>
      {icon && (
        <div aria-hidden="true" className="text-text-muted">
          {icon}
        </div>
      )}
      <Heading level={3}>{title}</Heading>
      {description && (
        <Text tone="muted" className="max-w-sm">
          {description}
        </Text>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
