import type { DocumentRole } from '@/lib/documents/schema';

export const ENGINEERING_PROFILE_DOCUMENT_ROLES = [
  'introduction',
  'interview',
  'timeline',
  'quotes',
  'achievements',
] as const satisfies readonly DocumentRole[];

export type EngineeringProfileDocumentRole = (typeof ENGINEERING_PROFILE_DOCUMENT_ROLES)[number];
