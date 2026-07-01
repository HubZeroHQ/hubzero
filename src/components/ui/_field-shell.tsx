import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Internal layout helpers shared by the form primitives — not part of the
 * public design-system component set, so not re-exported from the ui
 * barrel. Exists so label/hint/error markup is written once instead of
 * duplicated across Input, Textarea, Select, Checkbox, Radio, and Switch.
 */

export interface FieldMessageProps {
  hint?: string;
  hintId?: string;
  error?: string;
  errorId?: string;
}

export function FieldMessage({ hint, hintId, error, errorId }: FieldMessageProps) {
  if (error) {
    return (
      <p id={errorId} role="alert" className="text-caption text-danger mt-1.5">
        {error}
      </p>
    );
  }
  if (hint) {
    return (
      <p id={hintId} className="text-caption text-text-muted mt-1.5">
        {hint}
      </p>
    );
  }
  return null;
}

export interface FieldShellProps extends FieldMessageProps {
  fieldId: string;
  label?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

/** Label-above-control layout, used by Input/Textarea/Select. */
export function FieldShell({
  fieldId,
  label,
  required,
  hint,
  hintId,
  error,
  errorId,
  children,
  className,
}: FieldShellProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {label && (
        <Label htmlFor={fieldId} required={required}>
          {label}
        </Label>
      )}
      {children}
      <FieldMessage hint={hint} hintId={hintId} error={error} errorId={errorId} />
    </div>
  );
}
