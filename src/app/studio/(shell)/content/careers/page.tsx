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
import { PUBLISH_WORKFLOW_ORDER } from '@/config/workflow';
import { buildListHref, filterAndPaginate, parsePage } from '@/lib/studio/list-query';
import { careerRepository } from '@/lib/db/repositories/career';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import type { Career } from '@/types/studio';

export const metadata: Metadata = { title: 'Careers — HubZero Studio' };

const CAREERS_LIST_PATH = '/studio/content/careers';

const EMPLOYMENT_TYPE_LABEL: Record<Career['employmentType'], string> = {
  fullTime: 'Full-time',
  partTime: 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
};

interface CareersSearchParams {
  q?: string;
  status?: string;
  technology?: string;
  employmentType?: string;
  page?: string;
  [key: string]: string | undefined;
}

export default async function CareersListPage({
  searchParams,
}: {
  searchParams: Promise<CareersSearchParams>;
}) {
  const params = await searchParams;
  const [allEntries, technologies] = await Promise.all([
    careerRepository.list(),
    taxonomyRepository.findByKind('technology'),
  ]);

  const selectedTechnologyIds = params.technology
    ? params.technology.split(',').filter(Boolean)
    : [];

  const result = filterAndPaginate<Career>({
    entries: allEntries,
    query: params.q,
    searchFields: (entry) => [entry.title, entry.slug, entry.referenceId, entry.location],
    predicates: [
      (entry) => (params.status ? entry.status === params.status : true),
      (entry) => (params.employmentType ? entry.employmentType === params.employmentType : true),
      (entry) =>
        selectedTechnologyIds.length === 0
          ? true
          : entry.technologyIds.some((id) => selectedTechnologyIds.includes(id.toString())),
    ],
    sort: (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    page: parsePage(params),
  });

  const columns: EntryTableColumn<Career>[] = [
    { key: 'title', header: 'Title', render: (entry) => entry.title },
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
      key: 'location',
      header: 'Location',
      render: (entry) => <span className="text-text-secondary text-sm">{entry.location}</span>,
    },
    {
      key: 'employmentType',
      header: 'Employment',
      render: (entry) => (
        <span className="text-text-secondary text-sm">
          {EMPLOYMENT_TYPE_LABEL[entry.employmentType]}
        </span>
      ),
    },
  ];

  const hasAnyEntries = allEntries.length > 0;
  const hasFiltersApplied = Boolean(
    params.q || params.status || params.employmentType || params.technology,
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Careers"
        description="Open roles and how to reach HubZero. Every entry here is a live view of the Careers collection — the public /careers page shows only Published listings."
        actions={<ButtonLink href={`${CAREERS_LIST_PATH}/new`}>New Career listing</ButtonLink>}
      />

      <form action={CAREERS_LIST_PATH} method="GET" className="flex gap-2">
        <input type="hidden" name="status" value={params.status ?? ''} />
        <input type="hidden" name="technology" value={params.technology ?? ''} />
        <input type="hidden" name="employmentType" value={params.employmentType ?? ''} />
        <Input
          type="search"
          name="q"
          defaultValue={params.q}
          placeholder="Search by title, slug, location, or reference ID…"
          className="max-w-sm"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          href={buildListHref(CAREERS_LIST_PATH, params, { status: undefined, page: undefined })}
          active={!params.status}
        >
          All
        </FilterChip>
        {PUBLISH_WORKFLOW_ORDER.map((status) => (
          <FilterChip
            key={status}
            href={buildListHref(CAREERS_LIST_PATH, params, { status, page: undefined })}
            active={params.status === status}
          >
            {status}
          </FilterChip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {technologies.length > 0 ? (
          <ComboboxFilter
            basePath={CAREERS_LIST_PATH}
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

        <ComboboxFilter
          basePath={CAREERS_LIST_PATH}
          params={params}
          paramKey="employmentType"
          options={Object.entries(EMPLOYMENT_TYPE_LABEL).map(([id, label]) => ({ id, label }))}
          placeholder="All employment types"
          searchPlaceholder="Search employment types…"
          ariaLabel="Filter by employment type"
        />
      </div>

      {result.items.length === 0 ? (
        hasAnyEntries ? (
          <EmptyState
            title="No entries match your filters."
            description="Try a different search term or clear the filters above."
            action={
              hasFiltersApplied ? (
                <ButtonLink href={CAREERS_LIST_PATH} variant="secondary">
                  Clear filters
                </ButtonLink>
              ) : undefined
            }
          />
        ) : (
          <EmptyState
            title="No Career listings yet."
            description="Create the first one — it stays a Draft until it's ready to publish."
            action={<ButtonLink href={`${CAREERS_LIST_PATH}/new`}>New Career listing</ButtonLink>}
          />
        )
      ) : (
        <>
          <EntryTable
            entries={result.items}
            columns={columns}
            getRowHref={(entry) => `${CAREERS_LIST_PATH}/${entry._id.toString()}`}
            getRowKey={(entry) => entry._id.toString()}
          />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            buildHref={(page) => buildListHref(CAREERS_LIST_PATH, params, { page })}
          />
        </>
      )}
    </div>
  );
}
