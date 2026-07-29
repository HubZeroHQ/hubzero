import { z } from 'zod';

const PUBLIC_CONTEXT =
  /^\/(work|builds|blueprints|labs|notes|engineering)(\/[a-z0-9]+(?:-[a-z0-9]+)*)?$/;
const NAMED_SOURCES = new Set(['direct', 'home', 'navigation', 'services', 'about']);

export interface ContactValues {
  name: string;
  email: string;
  message: string;
}

export interface ContactActionState {
  status: 'idle' | 'error' | 'success';
  message?: string;
  fieldErrors?: Partial<Record<keyof ContactValues, string>>;
  values: ContactValues;
}

export const INITIAL_CONTACT_STATE: ContactActionState = {
  status: 'idle',
  values: { name: '', email: '', message: '' },
};

export const publicContactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Enter your name.')
    .max(100, 'Keep your name under 100 characters.'),
  email: z
    .string()
    .trim()
    .email('Enter a valid email address.')
    .max(254, 'Keep your email under 254 characters.')
    .transform((value) => value.toLowerCase()),
  message: z
    .string()
    .trim()
    .min(1, 'Describe the problem or context you want to discuss.')
    .max(5_000, 'Keep the initial message under 5,000 characters.'),
});

export function normalizeContactSource(value: unknown): string {
  if (typeof value !== 'string') return 'direct';
  const source = value.trim().slice(0, 180);
  if (NAMED_SOURCES.has(source) || PUBLIC_CONTEXT.test(source)) return source;
  return 'direct';
}

export function describeContactSource(source: string): string {
  if (source === 'direct') return 'Direct enquiry';
  if (source === 'home') return 'HubZero home';
  if (source === 'navigation') return 'Primary navigation';
  if (source === 'services') return 'Services';
  if (source === 'about') return 'About';
  const [collection, slug] = source.slice(1).split('/');
  const label = collection === 'engineering' ? 'Engineering profile' : titleCase(collection ?? '');
  return slug ? `${label} / ${slug.replaceAll('-', ' ')}` : label;
}

export function isLikelyAutomated(input: {
  website: unknown;
  startedAt: unknown;
  now?: number;
}): boolean {
  if (typeof input.website === 'string' && input.website.trim()) return true;
  const startedAt = Number(input.startedAt);
  if (!Number.isFinite(startedAt) || startedAt <= 0) return true;
  return (input.now ?? Date.now()) - startedAt < 1_500;
}

export function contactValuesFromFormData(formData: FormData): ContactValues {
  return {
    name: boundedString(formData.get('name'), 100),
    email: boundedString(formData.get('email'), 254),
    message: boundedString(formData.get('message'), 5_000),
  };
}

function boundedString(value: FormDataEntryValue | null, maximum: number): string {
  return typeof value === 'string' ? value.slice(0, maximum) : '';
}

function titleCase(value: string): string {
  return value ? `${value[0]?.toUpperCase()}${value.slice(1)}` : value;
}
