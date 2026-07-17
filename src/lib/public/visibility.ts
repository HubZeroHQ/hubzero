import type { DocumentRole, OwnerType } from '@/lib/documents/schema';
import type { PublicEntityType } from './domain';

export type VisibilityRecord =
  | {
      type: Exclude<PublicEntityType, 'teamMember' | 'service' | 'engineeringProfile'>;
      status?: unknown;
    }
  | { type: 'service'; status?: unknown }
  | { type: 'teamMember'; publicProfile?: unknown }
  | { type: 'engineeringProfile'; status?: unknown; teamPublic?: unknown };

const PUBLIC_DOCUMENT_ROLES: Readonly<Record<OwnerType, readonly DocumentRole[]>> = {
  Work: ['caseStudy'],
  Build: ['caseStudy', 'technical'],
  Blueprint: ['caseStudy'],
  Lab: ['overview', 'engineeringJournal', 'findings', 'researchNotes'],
  Note: ['body'],
  EngineeringProfile: ['introduction', 'interview', 'timeline', 'quotes', 'achievements'],
  Team: [],
};

/** The one fail-closed predicate used before any public expansion or mapping. */
export function isPubliclyVisible(record: VisibilityRecord): boolean {
  if (record.type === 'teamMember') {
    return record.publicProfile === true;
  }
  if (record.type === 'engineeringProfile') {
    return record.status === 'published' && record.teamPublic === true;
  }
  return record.status === 'published';
}

export function isPublicDocumentRole(ownerType: OwnerType, role: DocumentRole): boolean {
  return PUBLIC_DOCUMENT_ROLES[ownerType].includes(role);
}

export type PublicLookupFailure =
  'notFound' | 'unpublished' | 'archived' | 'malformed' | 'unavailable';

/** Hidden record states are intentionally indistinguishable to public consumers. */
export function publicFailureStatus(reason: PublicLookupFailure): 404 | 503 {
  return reason === 'unavailable' ? 503 : 404;
}
