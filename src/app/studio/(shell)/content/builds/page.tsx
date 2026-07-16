import type { Metadata } from 'next';
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
import { buildRepository } from '@/lib/db/repositories/build';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import { formatRelativeTime } from '@/lib/utils/relative-time';
import type { Build, BuildDeploymentState } from '@/types/studio';

export const metadata: Metadata = { title: 'Builds — HubZero Studio' };

const BUILDS_LIST_PATH = '/studio/content/builds';

const DEPLOYMENT_STATE_LABEL: Record<BuildDeploymentState, string> = {
  live: 'Live',
  retired: 'Retired',
};

interface BuildsSearchParams {
  q?: string;
  status?: string;
  technology?: string;
  deployment?: string;
  page?: string;
  [key: string]: string | undefined;
}

export default async function BuildsListPage({
  searchParams,
}: {
  searchParams: Promise<BuildsSearchParams>;
}) {
  const params = await searchParams;
  const [allEntries, technologies] = await Promise.all([
    buildRepository.list(),
    taxonomyRepository.findByKind('technology'),
  ]);

  const result = filterAndPaginate<Build>({
    entries: allEntries,
    query: params.q,
    searchFields: (entry) => [entry.title, entry.slug, entry.referenceId],
    predicates: [
      (entry) => (params.status ? entry.status === params.status : true),
      (entry) => (params.deployment ? entry.deploymentState === params.deployment : true),
      (entry) =>
        params.technology
          ? entry.technologyIds.some((id) => id.toString() === params.technology)
          : true,
    ],
    sort: (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    page: parsePage(params),
  });

  const columns: EntryTableColumn<Build>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (entry) => (
        <span className="inline-flex items-center gap-2">
          {entry.title}
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
      key: 'deploymentState',
      header: 'Deployment',
      render: (entry) => (
        <span className="text-text-secondary text-sm">
          {DEPLOYMENT_STATE_LABEL[entry.deploymentState]}
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
  const hasFiltersApplied = Boolean(params.q || params.status || params.technology || params.deployment);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Builds"
        description="Finished internal products — every entry here is a live view of the Builds collection (PLANNING.md §26.2)."
        actions={<ButtonLink href={`${BUILDS_LIST_PATH}/new`}>New Build</ButtonLink>}
      />

      <form action={BUILDS_LIST_PATH} method="GET" className="flex gap-2">
        <input type="hidden" name="status" value={params.status ?? ''} />
        <input type="hidden" name="technology" value={params.technology ?? ''} />
        <input type="hidden" name="deployment" value={params.deployment ?? ''} />
        <Input
          type="search"
          name="q"
          defaultValue={params.q}
          placeholder="Search by title, slug, or reference ID…"
          className="max-w-sm"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          href={buildListHref(BUILDS_LIST_PATH, params, { status: undefined, page: undefined })}
          active={!params.status}
        >
          All
        </FilterChip>
        {PUBLISH_WORKFLOW_ORDER.map((status) => (
          <FilterChip
            key={status}
            href={buildListHref(BUILDS_LIST_PATH, params, { status, page: undefined })}
            active={params.status === status}
          >
            {status}
          </FilterChip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          href={buildListHref(BUILDS_LIST_PATH, params, { deployment: undefined, page: undefined })}
          active={!params.deployment}
        >
          All deployments
        </FilterChip>
        {(Object.keys(DEPLOYMENT_STATE_LABEL) as BuildDeploymentState[]).map((state) => (
          <FilterChip
            key={state}
            href={buildListHref(BUILDS_LIST_PATH, params, { deployment: state, page: undefined })}
            active={params.deployment === state}
          >
            {DEPLOYMENT_STATE_LABEL[state]}
          </FilterChip>
        ))}
      </div>

      {technologies.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip
            href={buildListHref(BUILDS_LIST_PATH, params, { technology: undefined, page: undefined })}
            active={!params.technology}
          >
            All technologies
          </FilterChip>
          {technologies.map((technology) => (
            <FilterChip
              key={technology._id.toString()}
              href={buildListHref(BUILDS_LIST_PATH, params, {
                technology: technology._id.toString(),
                page: undefined,
              })}
              active={params.technology === technology._id.toString()}
            >
              {technology.label}
            </FilterChip>
          ))}
        </div>
      ) : null}

      {result.items.length === 0 ? (
        hasAnyEntries ? (
          <EmptyState
            title="No entries match your filters."
            description="Try a different search term or clear the filters above."
            action={
              hasFiltersApplied ? (
                <ButtonLink href={BUILDS_LIST_PATH} variant="secondary">
                  Clear filters
                </ButtonLink>
              ) : undefined
            }
          />
        ) : (
          <EmptyState
            title="No Builds yet."
            description="Create the first one to start building the Builds collection."
            action={<ButtonLink href={`${BUILDS_LIST_PATH}/new`}>New Build</ButtonLink>}
          />
        )
      ) : (
        <>
          <EntryTable
            entries={result.items}
            columns={columns}
            getRowHref={(entry) => `${BUILDS_LIST_PATH}/${entry._id.toString()}`}
            getRowKey={(entry) => entry._id.toString()}
          />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            buildHref={(page) => buildListHref(BUILDS_LIST_PATH, params, { page })}
          />
        </>
      )}
    </div>
  );
}
