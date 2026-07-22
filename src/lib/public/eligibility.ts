import type { PublishStatus } from '@/types/studio';
import { isPubliclyVisible } from './visibility';

/**
 * The Build publication contract — shared by the public repository
 * (`repository.ts`'s `mapSummary`/`findDetail`/`isHomepageEligible`) and
 * Studio's publication-readiness checklist (`BuildPublicationChecklist`).
 * Neither caller re-derives these rules against its own copy of the data;
 * both call the exact same predicates defined here. This is what keeps
 * Studio's "why isn't this public yet" answer from ever drifting out of
 * sync with what the repository actually enforces.
 */

export interface EligibilityDocument {
  role: string;
  blocks: readonly { id?: string; type: string; data: unknown }[];
}

/** A Build must own at least one Document in each of these roles to get a public detail page at all (§10, §26.2). */
export const BUILD_DETAIL_DOCUMENT_ROLES: readonly string[] = ['caseStudy', 'technical'];

export function hasRoles(
  documents: readonly { role: string }[],
  roles: readonly string[],
): boolean {
  return roles.every((role) => documents.some((document) => document.role === role));
}

/**
 * A Document counts as substantive once it clears a minimal bar of real
 * written content — at least two non-media blocks totaling 80+ words —
 * which filters out placeholder or skeleton documents without requiring an
 * arbitrary length threshold on any single block.
 */
export function hasSubstantiveDocument(
  documents: readonly { blocks: readonly { type: string; data: unknown }[] }[],
): boolean {
  return documents.some((document) => {
    const textBlocks = document.blocks.filter(
      (block) =>
        !['heading', 'divider', 'image', 'imageGallery', 'technologyStack'].includes(block.type),
    );
    const words = textBlocks
      .map((block) => JSON.stringify(block.data).replace(/<[^>]*>/g, ' '))
      .join(' ')
      .match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu);
    return textBlocks.length >= 2 && (words?.length ?? 0) >= 80;
  });
}

export function hasPublicSummary(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Mirrors `findDetail`'s `'build'` case gate in `repository.ts`. */
export function isBuildDetailEligible(documents: readonly EligibilityDocument[]): boolean {
  return hasRoles(documents, BUILD_DETAIL_DOCUMENT_ROLES);
}

/** Mirrors `isHomepageEligible`'s `'build'` case in `repository.ts`. */
export function isBuildHomepageEligible(input: {
  hasHero: boolean;
  documents: readonly EligibilityDocument[];
}): boolean {
  const required = input.documents.filter((document) =>
    BUILD_DETAIL_DOCUMENT_ROLES.includes(document.role),
  );
  return (
    input.hasHero &&
    required.length >= BUILD_DETAIL_DOCUMENT_ROLES.length &&
    required.every((document) => hasSubstantiveDocument([document]))
  );
}

/**
 * Homepage eligibility for Engineering Profiles. Visibility (published
 * profile + public Team) is enforced by the repository before this predicate;
 * this predicate only decides whether the public engineering record is strong
 * enough to demonstrate on the homepage.
 */
export function isEngineeringProfileHomepageEligible(input: {
  hasPortrait: boolean;
  contributionCount: number;
  documents: readonly EligibilityDocument[];
}): boolean {
  return (
    input.hasPortrait && input.contributionCount > 0 && hasSubstantiveDocument(input.documents)
  );
}

export type PublicSurface = 'index' | 'detail' | 'homepage' | 'search' | 'relationships';

export type BuildPublicationCheckId =
  | 'published'
  | 'summary'
  | 'caseStudy'
  | 'technical'
  | 'hero'
  | 'caseStudySubstantive'
  | 'technicalSubstantive';

export interface BuildPublicationCheck {
  id: BuildPublicationCheckId;
  label: string;
  passed: boolean;
  /** Public surfaces that stay excluded — or, for an already-published Build, that silently drop it — while this check fails. */
  affectedSurfaces: readonly PublicSurface[];
}

const ALL_SURFACES: readonly PublicSurface[] = [
  'index',
  'detail',
  'homepage',
  'search',
  'relationships',
];

export interface BuildPublicationInput {
  status: PublishStatus;
  summary: string | null | undefined;
  hasHero: boolean;
  documents: readonly EligibilityDocument[];
}

/**
 * The full Build publication contract, in the same order the public
 * repository applies it: `mapSummary`'s visibility + summary gate first,
 * then `findDetail`'s two-Document gate, then `isHomepageEligible`'s hero +
 * substantiveness gate. A Build can pass "Published" and "Public summary"
 * and still be invisible everywhere else — this returns every check
 * independently so Studio can show exactly which ones are still failing,
 * not just an overall yes/no.
 */
export function evaluateBuildPublicationChecklist(
  input: BuildPublicationInput,
): BuildPublicationCheck[] {
  const caseStudy = input.documents.find((document) => document.role === 'caseStudy');
  const technical = input.documents.find((document) => document.role === 'technical');

  return [
    {
      id: 'published',
      label: 'Published',
      passed: isPubliclyVisible({ type: 'build', status: input.status }),
      affectedSurfaces: ALL_SURFACES,
    },
    {
      id: 'summary',
      label: 'Public summary',
      passed: hasPublicSummary(input.summary),
      affectedSurfaces: ALL_SURFACES,
    },
    {
      id: 'caseStudy',
      label: 'Case Study document',
      passed: Boolean(caseStudy),
      affectedSurfaces: ['detail', 'homepage'],
    },
    {
      id: 'technical',
      label: 'Technical document',
      passed: Boolean(technical),
      affectedSurfaces: ['detail', 'homepage'],
    },
    {
      id: 'hero',
      label: 'Hero image',
      passed: input.hasHero,
      affectedSurfaces: ['homepage'],
    },
    {
      id: 'caseStudySubstantive',
      label: 'Case Study has enough written content (2+ blocks, 80+ words)',
      passed: Boolean(caseStudy) && hasSubstantiveDocument([caseStudy!]),
      affectedSurfaces: ['homepage'],
    },
    {
      id: 'technicalSubstantive',
      label: 'Technical document has enough written content (2+ blocks, 80+ words)',
      passed: Boolean(technical) && hasSubstantiveDocument([technical!]),
      affectedSurfaces: ['homepage'],
    },
  ];
}
