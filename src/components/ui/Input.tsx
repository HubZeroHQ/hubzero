import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * DESIGN_SYSTEM.md §7 Inputs & Textareas recipe, exported so other
 * field-shaped controls (the block editor's `<textarea>`/`<select>`
 * elements, which can't use this `<input>`-only component directly) share
 * the exact same look instead of hand-copying the class string.
 */
export const fieldClassName = cn(
  'bg-surface-default text-text-primary rounded-[4px] border border-[#2a2a2a] px-3 py-2 text-sm',
  'placeholder:text-text-muted',
  'focus-visible:border-accent focus-visible:bg-[#171717] focus-visible:outline-none',
  'duration-fast ease-standard transition-colors',
  'disabled:opacity-40',
);

/** DESIGN_SYSTEM.md §7 Inputs & Textareas — focus is the only state that changes; hover is intentionally inert. */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, disabled, ...props }, ref) {
    return (
      <input ref={ref} disabled={disabled} className={cn(fieldClassName, className)} {...props} />
    );
  },
);
