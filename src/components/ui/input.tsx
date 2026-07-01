import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";

import { FieldShell } from "@/components/ui/_field-shell";
import { useFieldA11y } from "@/lib/use-field-a11y";
import { cn } from "@/lib/utils";

export interface InputProps extends Omit<ComponentPropsWithoutRef<"input">, "id"> {
  id?: string;
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, hint, error, required, className, ...props },
  ref,
) {
  const { fieldId, hintId, errorId, describedBy, invalid } = useFieldA11y({ id, hint, error });

  return (
    <FieldShell
      fieldId={fieldId}
      label={label}
      required={required}
      hint={hint}
      hintId={hintId}
      error={error}
      errorId={errorId}
    >
      <input
        ref={ref}
        id={fieldId}
        required={required}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={cn(
          "bg-bg border-border text-body text-text placeholder:text-text-muted rounded-md border px-3 py-2",
          "transition-colors duration-150",
          invalid && "border-danger",
          className,
        )}
        {...props}
      />
    </FieldShell>
  );
});
