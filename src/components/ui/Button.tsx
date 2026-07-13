import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * DESIGN_SYSTEM.md §7 Buttons. `ghost` is a generalization of §5's nav-item
 * hover language (subtle `surface-elevated` fill on hover) for icon-only
 * chrome controls (sidebar collapse, palette close) — not a documented
 * button variant of its own, but the same visual rule applied to a second
 * kind of control rather than inventing a new one.
 */
type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-white text-black hover:brightness-[1.08] disabled:hover:brightness-100 shadow-[0_1px_0_rgba(0,0,0,0.05)]',
  secondary:
    'bg-transparent text-text-primary border border-border-default hover:bg-surface-elevated hover:border-border-strong',
  ghost: 'bg-transparent text-text-secondary hover:bg-surface-elevated hover:text-text-primary',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', className, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        'rounded-control inline-flex min-h-11 items-center justify-center gap-2 px-4 text-sm font-semibold',
        'duration-fast ease-standard transition-[filter,background-color,border-color,transform]',
        'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
