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
import { labRepository } from '@/lib/db/repositories/lab';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import { formatRelativeTime } from '@/lib/utils/relative-time';
import type { Lab, LabStage } from '@/types/studio';

export const metadata: Metadata = { title: 'Labs — HubZero Studio' };

const LABS_LIST_PATH = '/studio/content/labs';

const STAGE_LABEL: Record<LabStage, string> = {
  exploring: 'Exploring',
  building: 'Building',
  testing: 'Testing',
};

interface LabsSearchParams {
  q?: string;
  status?: string;
  stage?: string;
  technology?: string;
  page?: string;
  [key: string]: string | undefined;
}

export default async function LabsListPage({
  searchParams,
}: {
  searchParams: Promise<LabsSearchParams>;
}) {
  const params = await searchParams;
  const [allEntries, technologies] = await Promise.all([
    labRepository.list(),
    taxonomyRepository.findByKind('technology'),
  ]);

  const selectedTechnologyIds = params.technology
    ? params.technology.split(',').filter(Boolean)
    : [];

  const result = filterAndPaginate<Lab>({
    entries: allEntries,
    query: params.q,
    searchFields: (entry) => [entry.title, entry.slug, entry.referenceId],
    predicates: [
      (entry) => (params.status ? entry.status === params.status : true),
      (entry) => (params.stage ? entry.stage === params.stage : true),
      (entry) =>
        selectedTechnologyIds.length === 0
          ? true
          : entry.technologyIds.some((id) => selectedTechnologyIds.includes(id.toString())),
    ],
    sort: (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    page: parsePage(params),
  });

  const columns: EntryTableColumn<Lab>[] = [
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
      key: 'stage',
      header: 'Stage',
      render: (entry) => (
        <span className="text-text-secondary text-sm">{STAGE_LABEL[entry.stage]}</span>
      ),
    },
    {
      key: 'currentMilestone',
      header: 'Current milestone',
      render: (entry) => (
        <span className="text-text-secondary max-w-xs truncate text-sm">
          {entry.currentMilestone}
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
  const hasFiltersApplied = Boolean(params.q || params.status || params.stage || params.technology);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Labs"
        description="Active engineering exploration — every entry here is a live view of the Labs collection. These are not finished products; each communicates what's being explored, why, and where it currently stands."
        actions={<ButtonLink href={`${LABS_LIST_PATH}/new`}>New Lab</ButtonLink>}
      />

      <form action={LABS_LIST_PATH} method="GET" className="flex gap-2">
        <input type="hidden" name="status" value={params.status ?? ''} />
        <input type="hidden" name="stage" value={params.stage ?? ''} />
        <input type="hidden" name="technology" value={params.technology ?? ''} />
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
          href={buildListHref(LABS_LIST_PATH, params, { status: undefined, page: undefined })}
          active={!params.status}
        >
          All
        </FilterChip>
        {PUBLISH_WORKFLOW_ORDER.map((status) => (
          <FilterChip
            key={status}
            href={buildListHref(LABS_LIST_PATH, params, { status, page: undefined })}
            active={params.status === status}
          >
            {status}
          </FilterChip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ComboboxFilter
          basePath={LABS_LIST_PATH}
          params={params}
          paramKey="stage"
          options={(Object.entries(STAGE_LABEL) as [LabStage, string][]).map(([id, label]) => ({
            id,
            label,
          }))}
          placeholder="All stages"
          searchPlaceholder="Search stages…"
          ariaLabel="Filter by stage"
        />

        {technologies.length > 0 ? (
          <ComboboxFilter
            basePath={LABS_LIST_PATH}
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
                <ButtonLink href={LABS_LIST_PATH} variant="secondary">
                  Clear filters
                </ButtonLink>
              ) : undefined
            }
          />
        ) : (
          <EmptyState
            title="No Labs yet."
            description="Create the first one to start building the Labs collection."
            action={<ButtonLink href={`${LABS_LIST_PATH}/new`}>New Lab</ButtonLink>}
          />
        )
      ) : (
        <>
          <EntryTable
            entries={result.items}
            columns={columns}
            getRowHref={(entry) => `${LABS_LIST_PATH}/${entry._id.toString()}`}
            getRowKey={(entry) => entry._id.toString()}
          />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            buildHref={(page) => buildListHref(LABS_LIST_PATH, params, { page })}
          />
        </>
      )}
    </div>
  );
}
