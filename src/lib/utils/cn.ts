import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges conditional class names and resolves conflicting Tailwind utility
 * classes (e.g. a default `px-4` overridden by a caller's `px-2`).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
