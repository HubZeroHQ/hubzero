import type { Metadata } from 'next';
import { EntryTable, type EntryTableColumn } from '@/components/studio/collection/EntryTable';
import { FilterChip } from '@/components/studio/collection/FilterChip';
import { Pagination } from '@/components/studio/collection/Pagination';
import { PageHeader } from '@/components/studio/PageHeader';
import { Button } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { Tag } from '@/components/ui/Tag';
import { serviceRepository } from '@/lib/db/repositories/service';
import { buildListHref, filterAndPaginate, parsePage } from '@/lib/studio/list-query';
import type { Service } from '@/types/studio';

export const metadata: Metadata = { title: 'Services — HubZero Studio' };

const LIST_PATH = '/studio/services';

interface ServicesSearchParams {
  q?: string;
  status?: string;
  page?: string;
  [key: string]: string | undefined;
}

export default async function ServicesListPage({
  searchParams,
}: {
  searchParams: Promise<ServicesSearchParams>;
}) {
  const params = await searchParams;
  const allServices = await serviceRepository.list();

  const result = filterAndPaginate<Service>({
    entries: allServices,
    query: params.q,
    searchFields: (entry) => [entry.title, entry.description],
    predicates: [(entry) => (params.status ? entry.status === params.status : true)],
    sort: (a, b) => a.order - b.order || a.title.localeCompare(b.title),
    page: parsePage(params),
  });

  const columns: EntryTableColumn<Service>[] = [
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
      key: 'status',
      header: 'Status',
      render: (entry) => <StatusIndicator status={entry.status} />,
    },
    {
      key: 'evidence',
      header: 'Evidence links',
      render: (entry) => (
        <span className="text-text-muted text-sm">{entry.evidenceLinks.length}</span>
      ),
    },
  ];

  const hasAnyServices = allServices.length > 0;
  const hasFiltersApplied = Boolean(params.q || params.status);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Services"
        description="The canonical Services dataset — every entry links back to real evidence."
        actions={<ButtonLink href={`${LIST_PATH}/new`}>New Service</ButtonLink>}
      />

      <form action={LIST_PATH} method="GET" className="flex gap-2">
        <input type="hidden" name="status" value={params.status ?? ''} />
        <Input
          type="search"
          name="q"
          defaultValue={params.q}
          placeholder="Search by title or description…"
          className="max-w-sm"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          href={buildListHref(LIST_PATH, params, { status: undefined, page: undefined })}
          active={!params.status}
        >
          All
        </FilterChip>
        <FilterChip
          href={buildListHref(LIST_PATH, params, { status: 'draft', page: undefined })}
          active={params.status === 'draft'}
        >
          Draft
        </FilterChip>
        <FilterChip
          href={buildListHref(LIST_PATH, params, { status: 'published', page: undefined })}
          active={params.status === 'published'}
        >
          Published
        </FilterChip>
      </div>

      {result.items.length === 0 ? (
        hasAnyServices ? (
          <EmptyState
            title="No Services match your filters."
            description="Try a different search term or clear the filters above."
            action={
              hasFiltersApplied ? (
                <ButtonLink href={LIST_PATH} variant="secondary">
                  Clear filters
                </ButtonLink>
              ) : undefined
            }
          />
        ) : (
          <EmptyState
            title="No Services yet."
            description="Create the first Service and link it to real evidence."
            action={<ButtonLink href={`${LIST_PATH}/new`}>New Service</ButtonLink>}
          />
        )
      ) : (
        <>
          <EntryTable
            entries={result.items}
            columns={columns}
            getRowHref={(entry) => `${LIST_PATH}/${entry._id.toString()}`}
            getRowKey={(entry) => entry._id.toString()}
          />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            buildHref={(page) => buildListHref(LIST_PATH, params, { page })}
          />
        </>
      )}
    </div>
  );
}
