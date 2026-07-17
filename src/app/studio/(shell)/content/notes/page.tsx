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
import { noteRepository } from '@/lib/db/repositories/note';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import { userRepository } from '@/lib/db/repositories/user';
import { formatRelativeTime } from '@/lib/utils/relative-time';
import type { Note } from '@/types/studio';

export const metadata: Metadata = { title: 'Notes — HubZero Studio' };

const NOTES_LIST_PATH = '/studio/content/notes';

interface NotesSearchParams {
  q?: string;
  status?: string;
  technology?: string;
  author?: string;
  page?: string;
  [key: string]: string | undefined;
}

export default async function NotesListPage({
  searchParams,
}: {
  searchParams: Promise<NotesSearchParams>;
}) {
  const params = await searchParams;
  const [allEntries, technologies, users] = await Promise.all([
    noteRepository.list(),
    taxonomyRepository.findByKind('technology'),
    userRepository.list(),
  ]);

  const authorNames = new Map(users.map((entry) => [entry._id.toString(), entry.name]));
  const selectedTechnologyIds = params.technology
    ? params.technology.split(',').filter(Boolean)
    : [];

  const result = filterAndPaginate<Note>({
    entries: allEntries,
    query: params.q,
    searchFields: (entry) => [entry.title, entry.slug, entry.referenceId, entry.summary],
    predicates: [
      (entry) => (params.status ? entry.status === params.status : true),
      (entry) => (params.author ? entry.authorId.toString() === params.author : true),
      (entry) =>
        selectedTechnologyIds.length === 0
          ? true
          : entry.technologyIds.some((id) => selectedTechnologyIds.includes(id.toString())),
    ],
    sort: (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    page: parsePage(params),
  });

  const columns: EntryTableColumn<Note>[] = [
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
      key: 'author',
      header: 'Author',
      render: (entry) => (
        <span className="text-text-secondary text-sm">
          {authorNames.get(entry.authorId.toString()) ?? 'Unknown'}
        </span>
      ),
    },
    {
      key: 'publicationDate',
      header: 'Publication date',
      render: (entry) => (
        <span className="text-text-secondary text-sm">
          {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(entry.publicationDate)}
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
    params.q || params.status || params.technology || params.author,
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notes"
        description="HubZero's engineering notebook — architecture decisions, implementation notes, research summaries, performance investigations, and debugging write-ups worth publishing. Every entry here is a live view of the Notes collection (PLANNING.md §26.5)."
        actions={<ButtonLink href={`${NOTES_LIST_PATH}/new`}>New Note</ButtonLink>}
      />

      <form action={NOTES_LIST_PATH} method="GET" className="flex gap-2">
        <input type="hidden" name="status" value={params.status ?? ''} />
        <input type="hidden" name="technology" value={params.technology ?? ''} />
        <input type="hidden" name="author" value={params.author ?? ''} />
        <Input
          type="search"
          name="q"
          defaultValue={params.q}
          placeholder="Search by title, slug, summary, or reference ID…"
          className="max-w-sm"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          href={buildListHref(NOTES_LIST_PATH, params, { status: undefined, page: undefined })}
          active={!params.status}
        >
          All
        </FilterChip>
        {PUBLISH_WORKFLOW_ORDER.map((status) => (
          <FilterChip
            key={status}
            href={buildListHref(NOTES_LIST_PATH, params, { status, page: undefined })}
            active={params.status === status}
          >
            {status}
          </FilterChip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {technologies.length > 0 ? (
          <ComboboxFilter
            basePath={NOTES_LIST_PATH}
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

        {users.length > 0 ? (
          <ComboboxFilter
            basePath={NOTES_LIST_PATH}
            params={params}
            paramKey="author"
            options={users.map((user) => ({ id: user._id.toString(), label: user.name }))}
            placeholder="All authors"
            searchPlaceholder="Search authors…"
            ariaLabel="Filter by author"
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
                <ButtonLink href={NOTES_LIST_PATH} variant="secondary">
                  Clear filters
                </ButtonLink>
              ) : undefined
            }
          />
        ) : (
          <EmptyState
            title="No Notes yet."
            description="Create the first one to start building the engineering journal."
            action={<ButtonLink href={`${NOTES_LIST_PATH}/new`}>New Note</ButtonLink>}
          />
        )
      ) : (
        <>
          <EntryTable
            entries={result.items}
            columns={columns}
            getRowHref={(entry) => `${NOTES_LIST_PATH}/${entry._id.toString()}`}
            getRowKey={(entry) => entry._id.toString()}
          />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            buildHref={(page) => buildListHref(NOTES_LIST_PATH, params, { page })}
          />
        </>
      )}
    </div>
  );
}
