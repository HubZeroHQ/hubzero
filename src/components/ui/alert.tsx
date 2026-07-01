import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

const variants = {
  info: { icon: Info, classes: "border-info/30 bg-info/10 text-info" },
  success: { icon: CheckCircle2, classes: "border-success/30 bg-success/10 text-success" },
  warning: { icon: AlertTriangle, classes: "border-warning/30 bg-warning/10 text-warning" },
  danger: { icon: XCircle, classes: "border-danger/30 bg-danger/10 text-danger" },
} as const;

export interface AlertProps extends ComponentPropsWithoutRef<"div"> {
  /** @default "info" */
  variant?: keyof typeof variants;
  title?: string;
}

/**
 * Error/success/warning/info presentation. Color is never the only signal
 * (§6) — the icon and title wording carry the meaning too, so the body copy
 * stays neutral (text/text-muted) rather than fully tinted.
 */
export function Alert({ variant = "info", title, className, children, ...props }: AlertProps) {
  const { icon: Icon, classes } = variants[variant];
  const isUrgent = variant === "danger" || variant === "warning";

  return (
    <div
      role={isUrgent ? "alert" : "status"}
      className={cn("flex gap-3 rounded-lg border p-4", classes, className)}
      {...props}
    >
      <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="space-y-1">
        {title && <p className="text-body text-text font-medium">{title}</p>}
        <div className="text-body text-text-muted">{children}</div>
      </div>
    </div>
  );
}
