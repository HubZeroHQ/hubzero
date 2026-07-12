"use client";

import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { FieldMessage } from "@/components/ui/_field-shell";
import { Label } from "@/components/ui/label";
import { useFieldA11y } from "@/lib/use-field-a11y";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<
  ComponentPropsWithoutRef<typeof RadixCheckbox.Root>,
  "id"
> {
  id?: string;
  label?: ReactNode;
  hint?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  { id, label, hint, error, className, ...props },
  ref,
) {
  const { fieldId, hintId, errorId, describedBy, invalid } = useFieldA11y({ id, hint, error });

  return (
    <div>
      <div className="flex items-center gap-2">
        <RadixCheckbox.Root
          ref={ref}
          id={fieldId}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn(
            "border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent",
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border transition-colors duration-150",
            invalid && "border-danger",
            className,
          )}
          {...props}
        >
          <RadixCheckbox.Indicator className="text-accent-foreground">
            <Check className="h-3.5 w-3.5" />
          </RadixCheckbox.Indicator>
        </RadixCheckbox.Root>
        {label && (
          <Label htmlFor={fieldId} className="mb-0">
            {label}
          </Label>
        )}
      </div>
      <FieldMessage hint={hint} hintId={hintId} error={error} errorId={errorId} />
    </div>
  );
});
