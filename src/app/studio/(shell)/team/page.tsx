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
import { Tag } from '@/components/ui/Tag';
import { teamRepository } from '@/lib/db/repositories/team';
import { buildListHref, filterAndPaginate, parsePage } from '@/lib/studio/list-query';
import type { Team } from '@/types/studio';

export const metadata: Metadata = { title: 'Team — HubZero Studio' };

const LIST_PATH = '/studio/team';

interface TeamSearchParams {
  q?: string;
  group?: string;
  status?: string;
  page?: string;
  [key: string]: string | undefined;
}

export default async function TeamListPage({
  searchParams,
}: {
  searchParams: Promise<TeamSearchParams>;
}) {
  const params = await searchParams;
  const allMembers = await teamRepository.list();
  const groups = Array.from(new Set(allMembers.map((member) => member.group))).sort();

  const result = filterAndPaginate<Team>({
    entries: allMembers,
    query: params.q,
    searchFields: (entry) => [entry.name, entry.role, entry.referenceId],
    predicates: [
      (entry) => (params.group ? entry.group === params.group : true),
      (entry) => {
        if (params.status === 'archived') return entry.archived;
        if (params.status === 'active') return !entry.archived;
        return true;
      },
    ],
    sort: (a, b) => a.order - b.order || a.name.localeCompare(b.name),
    page: parsePage(params),
  });

  const columns: EntryTableColumn<Team>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (entry) => (
        <span className="inline-flex items-center gap-2">
          {entry.name}
          {entry.founder ? <Tag>Founder</Tag> : null}
          {entry.archived ? <Tag>Archived</Tag> : null}
          {!entry.publicProfile ? <Tag>Private</Tag> : null}
        </span>
      ),
    },
    {
      key: 'referenceId',
      header: 'Reference ID',
      render: (entry) => <ReferenceIdBadge referenceId={entry.referenceId} />,
    },
    { key: 'role', header: 'Role', render: (entry) => entry.role },
    { key: 'group', header: 'Group', render: (entry) => entry.group },
    {
      key: 'publicCategory',
      header: 'Public category',
      render: (entry) =>
        entry.publicCategory === 'leadership' ? 'Leadership' : 'Engineering Team',
    },
  ];

  const hasAnyMembers = allMembers.length > 0;
  const hasFiltersApplied = Boolean(params.q || params.group || params.status);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Team"
        description="Public-facing Team profiles — separate from Engineering Profiles (PLANNING.md §26.6/§26.9)."
        actions={<ButtonLink href={`${LIST_PATH}/new`}>New Team member</ButtonLink>}
      />

      <form action={LIST_PATH} method="GET" className="flex gap-2">
        <input type="hidden" name="group" value={params.group ?? ''} />
        <input type="hidden" name="status" value={params.status ?? ''} />
        <Input
          type="search"
          name="q"
          defaultValue={params.q}
          placeholder="Search by name, role, or reference ID…"
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
          href={buildListHref(LIST_PATH, params, { status: 'active', page: undefined })}
          active={params.status === 'active'}
        >
          Active
        </FilterChip>
        <FilterChip
          href={buildListHref(LIST_PATH, params, { status: 'archived', page: undefined })}
          active={params.status === 'archived'}
        >
          Archived
        </FilterChip>
      </div>

      {groups.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip
            href={buildListHref(LIST_PATH, params, { group: undefined, page: undefined })}
            active={!params.group}
          >
            All groups
          </FilterChip>
          {groups.map((group) => (
            <FilterChip
              key={group}
              href={buildListHref(LIST_PATH, params, { group, page: undefined })}
              active={params.group === group}
            >
              {group}
            </FilterChip>
          ))}
        </div>
      ) : null}

      {result.items.length === 0 ? (
        hasAnyMembers ? (
          <EmptyState
            title="No Team members match your filters."
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
            title="No Team members yet."
            description="Create the first public Team profile."
            action={<ButtonLink href={`${LIST_PATH}/new`}>New Team member</ButtonLink>}
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
