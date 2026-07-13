import Link, { type LinkProps } from 'next/link';
import type { ReactNode } from 'react';
import { buttonClassName, type ButtonVariant } from './Button';

/**
 * A navigational action that must look like a `Button` (e.g. "New Work
 * entry") — `Button` renders a real `<button>`, so nesting a `Link` inside
 * it would be invalid HTML. This shares `Button`'s exact class recipe via
 * `buttonClassName` instead of duplicating it.
 */
export function ButtonLink({
  variant = 'primary',
  className,
  children,
  ...props
}: LinkProps & { variant?: ButtonVariant; className?: string; children: ReactNode }) {
  return (
    <Link className={buttonClassName(variant, className)} {...props}>
      {children}
    </Link>
  );
}
