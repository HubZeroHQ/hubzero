import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

export interface LabelProps extends ComponentPropsWithoutRef<"label"> {
  /** Visual asterisk only — put the actual `required` attribute on the control so AT announces it. */
  required?: boolean;
}

export function Label({ required, className, children, ...props }: LabelProps) {
  return (
    <label className={cn("text-body text-text mb-1.5 block font-medium", className)} {...props}>
      {children}
      {required && (
        <span aria-hidden="true" className="text-danger ml-0.5">
          *
        </span>
      )}
    </label>
  );
}
