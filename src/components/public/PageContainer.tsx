import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export function PageContainer({
  as: Component = 'div',
  className,
  children,
  ...props
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>) {
  return (
    <Component className={cn('public-container', className)} {...props}>
      {children}
    </Component>
  );
}

export function PublicSection({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'section'>, 'children'>) {
  return (
    <section className={cn('public-section', className)} {...props}>
      {children}
    </section>
  );
}
