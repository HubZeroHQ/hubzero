"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";
import type { ComponentPropsWithoutRef } from "react";

import { FieldShell } from "@/components/ui/_field-shell";
import { IconButton } from "@/components/ui/icon-button";
import { useFieldA11y } from "@/lib/use-field-a11y";
import { cn } from "@/lib/utils";

export interface PasswordInputProps extends Omit<ComponentPropsWithoutRef<"input">, "id" | "type"> {
  id?: string;
  label?: string;
  hint?: string;
  error?: string;
}

/**
 * `Input` with a show/hide toggle — used anywhere a password is entered
 * (login, Users create/edit). A masked-only field with no way to verify
 * what was typed is a real accessibility/usability gap, not a security
 * feature; the toggle is client-side state only, never sent anywhere.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ id, label, hint, error, required, className, ...props }, ref) {
    const [visible, setVisible] = useState(false);
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
        <div className="relative">
          <input
            ref={ref}
            id={fieldId}
            type={visible ? "text" : "password"}
            required={required}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className={cn(
              "bg-bg border-border text-body text-text placeholder:text-text-muted w-full rounded-md border py-2 pr-11 pl-3",
              "transition-colors duration-150",
              invalid && "border-danger",
              className,
            )}
            {...props}
          />
          <IconButton
            type="button"
            variant="ghost"
            size="sm"
            aria-label={visible ? "Hide password" : "Show password"}
            icon={visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            onClick={() => setVisible((value) => !value)}
            className="absolute top-1/2 right-1 -translate-y-1/2"
          />
        </div>
      </FieldShell>
    );
  },
);
