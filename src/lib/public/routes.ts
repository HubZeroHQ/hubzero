import type { PublicDetailEntityType, PublicEntityType, PublicTaxonomyTerm } from './domain';

type QueryValue = string | number | boolean | undefined;
type Query = Readonly<Record<string, QueryValue>>;

const COLLECTION_ROUTES = {
  work: '/work',
  build: '/builds',
  blueprint: '/blueprints',
  lab: '/labs',
  note: '/notes',
  engineeringProfile: '/engineering',
  teamMember: '/about',
  service: '/services',
  career: '/careers',
} as const satisfies Record<PublicEntityType, string>;

function withQuery(path: string, query: Query = {}): string {
  const parameters = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) parameters.set(key, String(value));
  }
  const serialized = parameters.toString();
  return serialized ? `${path}?${serialized}` : path;
}

/**
 * HubZero's single public URL adapter. It is intentionally limited to
 * canonical paths and query construction; no component may concatenate an
 * entity route for itself.
 */
export const publicRoute = {
  home: () => '/' as const,
  about: () => '/about' as const,
  ledger: () => '/ledger' as const,
  privacy: () => '/privacy' as const,
  contact: (query?: Query) => withQuery('/contact', query),
  search: (query?: Query) => withQuery('/search', query),
  collection: (type: PublicEntityType) => COLLECTION_ROUTES[type],
  entity: (input: { type: PublicDetailEntityType; slug: string }) =>
    `${COLLECTION_ROUTES[input.type]}/${encodeURIComponent(input.slug)}`,
  workCategory: (slug?: string) =>
    withQuery(COLLECTION_ROUTES.work, { category: slug ? slug : undefined }),
  blueprintFilter: (query: { architecture?: string; designLanguage?: string }) =>
    withQuery(COLLECTION_ROUTES.blueprint, {
      architecture: query.architecture,
      designLanguage: query.designLanguage,
    }),
  labStage: (stage?: string) =>
    withQuery(COLLECTION_ROUTES.lab, { stage: stage ? stage : undefined }),
  taxonomy: (term: Pick<PublicTaxonomyTerm, 'kind' | 'label' | 'slug'>) =>
    term.kind === 'category'
      ? withQuery(COLLECTION_ROUTES.work, { category: term.slug })
      : withQuery('/search', { q: term.label }),
};
