"use client";

import * as RadixSwitch from "@radix-ui/react-switch";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { FieldMessage } from "@/components/ui/_field-shell";
import { Label } from "@/components/ui/label";
import { useFieldA11y } from "@/lib/use-field-a11y";
import { cn } from "@/lib/utils";

export interface SwitchProps extends Omit<ComponentPropsWithoutRef<typeof RadixSwitch.Root>, "id"> {
  id?: string;
  label?: ReactNode;
  hint?: string;
  error?: string;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { id, label, hint, error, className, ...props },
  ref,
) {
  const { fieldId, hintId, errorId, describedBy, invalid } = useFieldA11y({ id, hint, error });

  return (
    <div>
      <div className="flex items-center gap-3">
        <RadixSwitch.Root
          ref={ref}
          id={fieldId}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={cn(
            "bg-border data-[state=checked]:bg-accent relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150",
            className,
          )}
          {...props}
        >
          <RadixSwitch.Thumb className="bg-bg block h-5 w-5 translate-x-0.5 rounded-full transition-transform duration-150 will-change-transform data-[state=checked]:translate-x-[1.375rem]" />
        </RadixSwitch.Root>
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
