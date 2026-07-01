"use client";

import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

import { FieldMessage } from "@/components/ui/_field-shell";
import { Label } from "@/components/ui/label";
import { useFieldA11y } from "@/lib/use-field-a11y";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface SelectProps {
  id?: string;
  name?: string;
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function Select({
  id,
  name,
  label,
  hint,
  error,
  placeholder = "Select…",
  options,
  value,
  defaultValue,
  onValueChange,
  disabled,
  required,
  className,
}: SelectProps) {
  const { fieldId, hintId, errorId, describedBy, invalid } = useFieldA11y({ id, hint, error });

  return (
    <div className={cn("flex flex-col", className)}>
      {label && (
        <Label htmlFor={fieldId} required={required}>
          {label}
        </Label>
      )}
      <RadixSelect.Root
        name={name}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        required={required}
      >
        <RadixSelect.Trigger
          id={fieldId}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={cn(
            "bg-bg border-border text-body text-text flex items-center justify-between gap-2 rounded-md border px-3 py-2",
            "data-[placeholder]:text-text-muted transition-colors duration-150",
            invalid && "border-danger",
          )}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <ChevronDown className="text-text-muted h-4 w-4" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={4}
            className="bg-bg-light border-border-muted z-[var(--z-dropdown)] overflow-hidden rounded-md border shadow-md"
          >
            <RadixSelect.Viewport className="p-1">
              {options.map((option) => (
                <RadixSelect.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={cn(
                    "text-body text-text data-[highlighted]:bg-accent/15 data-[highlighted]:text-accent",
                    "flex cursor-default items-center justify-between rounded-sm px-3 py-2 outline-none",
                    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                  )}
                >
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator>
                    <Check className="h-4 w-4" />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
      <FieldMessage hint={hint} hintId={hintId} error={error} errorId={errorId} />
    </div>
  );
}
