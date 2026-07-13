import { fieldClassName } from '@/components/ui/Input';
import { cn } from '@/lib/utils/cn';

/** Shared with every block field editor so raw `<textarea>`/`<select>` elements match `Input`'s exact look (`Input.tsx`'s own docblock explains why `fieldClassName` is exported separately). */
export const textareaClass = cn(fieldClassName, 'w-full');
export const selectClass = cn(fieldClassName, 'px-2');
