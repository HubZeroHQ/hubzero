"use client";

import * as RadixRadioGroup from "@radix-ui/react-radio-group";
import { useId } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { FieldMessage } from "@/components/ui/_field-shell";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface RadioOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps extends Omit<
  ComponentPropsWithoutRef<typeof RadixRadioGroup.Root>,
  "id"
> {
  id?: string;
  /** Legend for the group — a radio group is a fieldset, not a single labelled control. */
  label?: string;
  options: RadioOption[];
  hint?: string;
  error?: string;
}

/**
 * The requested "Radio" primitive, implemented as a group: a standalone
 * radio button isn't a valid accessible unit on its own — HTML/ARIA radios
 * only make sense as a named, single-selection set.
 */
export function RadioGroup({
  id,
  label,
  options,
  hint,
  error,
  className,
  ...props
}: RadioGroupProps) {
  const generatedId = useId();
  const groupId = id ?? generatedId;
  const hintId = hint ? `${groupId}-hint` : undefined;
  const errorId = error ? `${groupId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <fieldset aria-describedby={describedBy} aria-invalid={Boolean(error) || undefined}>
      {label && <legend className="text-body text-text mb-2 font-medium">{label}</legend>}
      <RadixRadioGroup.Root className={cn("flex flex-col gap-2", className)} {...props}>
        {options.map((option) => {
          const itemId = `${groupId}-${option.value}`;
          return (
            <div key={option.value} className="flex items-center gap-2">
              <RadixRadioGroup.Item
                id={itemId}
                value={option.value}
                disabled={option.disabled}
                className={cn(
                  "border-border data-[state=checked]:border-accent",
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-150",
                )}
              >
                <RadixRadioGroup.Indicator className="bg-accent block h-2.5 w-2.5 rounded-full" />
              </RadixRadioGroup.Item>
              <Label htmlFor={itemId} className="mb-0">
                {option.label}
              </Label>
            </div>
          );
        })}
      </RadixRadioGroup.Root>
      <FieldMessage hint={hint} hintId={hintId} error={error} errorId={errorId} />
    </fieldset>
  );
}
