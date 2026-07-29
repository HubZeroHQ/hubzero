import type { Metadata } from 'next';
import { ComboboxFilter } from '@/components/studio/collection/ComboboxFilter';
import { EntryTable, type EntryTableColumn } from '@/components/studio/collection/EntryTable';
import { FilterChip } from '@/components/studio/collection/FilterChip';
import { Pagination } from '@/components/studio/collection/Pagination';
import { PageHeader } from '@/components/studio/PageHeader';
import { Button } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { ReferenceIdBadge } from '@/components/ui/ReferenceIdBadge';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { Tag } from '@/components/ui/Tag';
import { PUBLISH_WORKFLOW_ORDER } from '@/config/workflow';
import { buildListHref, filterAndPaginate, parsePage } from '@/lib/studio/list-query';
import { blueprintRepository } from '@/lib/db/repositories/blueprint';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import { formatRelativeTime } from '@/lib/utils/relative-time';
import type { Blueprint } from '@/types/studio';

export const metadata: Metadata = { title: 'Blueprints — HubZero Studio' };

const BLUEPRINTS_LIST_PATH = '/studio/content/blueprints';

interface BlueprintsSearchParams {
  q?: string;
  status?: string;
  technology?: string;
  architecture?: string;
  designLanguage?: string;
  page?: string;
  [key: string]: string | undefined;
}

export default async function BlueprintsListPage({
  searchParams,
}: {
  searchParams: Promise<BlueprintsSearchParams>;
}) {
  const params = await searchParams;
  const [allEntries, technologies] = await Promise.all([
    blueprintRepository.list(),
    taxonomyRepository.findByKind('technology'),
  ]);

  const architectures = Array.from(new Set(allEntries.map((entry) => entry.architecture))).sort();
  const designLanguages = Array.from(
    new Set(allEntries.map((entry) => entry.designLanguage)),
  ).sort();

  // Technology is the one facet genuinely worth filtering by more than one
  // value at a time (a Blueprint tags several technologies at once, §26.3)
  // — encoded as a single comma-joined query value so `buildListHref` and
  // every single-select `FilterChip`/`ComboboxFilter` on this same page
  // need no change to support it (see `ComboboxFilter`'s own doc comment).
  const selectedTechnologyIds = params.technology
    ? params.technology.split(',').filter(Boolean)
    : [];

  const result = filterAndPaginate<Blueprint>({
    entries: allEntries,
    query: params.q,
    searchFields: (entry) => [entry.name, entry.slug, entry.referenceId],
    predicates: [
      (entry) => (params.status ? entry.status === params.status : true),
      (entry) => (params.architecture ? entry.architecture === params.architecture : true),
      (entry) => (params.designLanguage ? entry.designLanguage === params.designLanguage : true),
      (entry) =>
        selectedTechnologyIds.length === 0
          ? true
          : entry.technologyIds.some((id) => selectedTechnologyIds.includes(id.toString())),
    ],
    sort: (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    page: parsePage(params),
  });

  const columns: EntryTableColumn<Blueprint>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (entry) => (
        <span className="inline-flex items-center gap-2">
          {entry.name}
          {entry.featured ? <Tag>Featured</Tag> : null}
        </span>
      ),
    },
    {
      key: 'referenceId',
      header: 'Reference ID',
      render: (entry) => <ReferenceIdBadge referenceId={entry.referenceId} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (entry) => <StatusIndicator status={entry.status} />,
    },
    {
      key: 'classification',
      header: 'Architecture · Design language',
      render: (entry) => (
        <span className="text-text-secondary text-sm">
          {entry.architecture} · {entry.designLanguage}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      render: (entry) => (
        <span className="text-text-muted text-xs">{formatRelativeTime(entry.updatedAt)}</span>
      ),
    },
  ];

  const hasAnyEntries = allEntries.length > 0;
  const hasFiltersApplied = Boolean(
    params.q || params.status || params.technology || params.architecture || params.designLanguage,
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Blueprints"
        description="Reusable website foundations — every entry here is a live view of the Blueprints collection. The library is actively growing."
        actions={<ButtonLink href={`${BLUEPRINTS_LIST_PATH}/new`}>New Blueprint</ButtonLink>}
      />

      <form action={BLUEPRINTS_LIST_PATH} method="GET" className="flex gap-2">
        <input type="hidden" name="status" value={params.status ?? ''} />
        <input type="hidden" name="technology" value={params.technology ?? ''} />
        <input type="hidden" name="architecture" value={params.architecture ?? ''} />
        <input type="hidden" name="designLanguage" value={params.designLanguage ?? ''} />
        <Input
          type="search"
          name="q"
          defaultValue={params.q}
          placeholder="Search by name, slug, or reference ID…"
          className="max-w-sm"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          href={buildListHref(BLUEPRINTS_LIST_PATH, params, { status: undefined, page: undefined })}
          active={!params.status}
        >
          All
        </FilterChip>
        {PUBLISH_WORKFLOW_ORDER.map((status) => (
          <FilterChip
            key={status}
            href={buildListHref(BLUEPRINTS_LIST_PATH, params, { status, page: undefined })}
            active={params.status === status}
          >
            {status}
          </FilterChip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {architectures.length > 0 ? (
          <ComboboxFilter
            basePath={BLUEPRINTS_LIST_PATH}
            params={params}
            paramKey="architecture"
            options={architectures.map((architecture) => ({
              id: architecture,
              label: architecture,
            }))}
            placeholder="All architectures"
            searchPlaceholder="Search architectures…"
            ariaLabel="Filter by architecture"
          />
        ) : null}

        {designLanguages.length > 0 ? (
          <ComboboxFilter
            basePath={BLUEPRINTS_LIST_PATH}
            params={params}
            paramKey="designLanguage"
            options={designLanguages.map((designLanguage) => ({
              id: designLanguage,
              label: designLanguage,
            }))}
            placeholder="All design languages"
            searchPlaceholder="Search design languages…"
            ariaLabel="Filter by design language"
          />
        ) : null}

        {technologies.length > 0 ? (
          <ComboboxFilter
            basePath={BLUEPRINTS_LIST_PATH}
            params={params}
            paramKey="technology"
            multiple
            options={technologies.map((technology) => ({
              id: technology._id.toString(),
              label: technology.label,
            }))}
            placeholder="All technologies"
            searchPlaceholder="Search technologies…"
            ariaLabel="Filter by technology"
          />
        ) : null}
      </div>

      {result.items.length === 0 ? (
        hasAnyEntries ? (
          <EmptyState
            title="No entries match your filters."
            description="Try a different search term or clear the filters above."
            action={
              hasFiltersApplied ? (
                <ButtonLink href={BLUEPRINTS_LIST_PATH} variant="secondary">
                  Clear filters
                </ButtonLink>
              ) : undefined
            }
          />
        ) : (
          <EmptyState
            title="No Blueprints yet."
            description="Create the first one to start building the Blueprints collection."
            action={<ButtonLink href={`${BLUEPRINTS_LIST_PATH}/new`}>New Blueprint</ButtonLink>}
          />
        )
      ) : (
        <>
          <EntryTable
            entries={result.items}
            columns={columns}
            getRowHref={(entry) => `${BLUEPRINTS_LIST_PATH}/${entry._id.toString()}`}
            getRowKey={(entry) => entry._id.toString()}
          />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            buildHref={(page) => buildListHref(BLUEPRINTS_LIST_PATH, params, { page })}
          />
        </>
      )}
    </div>
  );
}
