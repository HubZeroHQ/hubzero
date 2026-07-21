import type { Metadata } from 'next';
import { EntryTable, type EntryTableColumn } from '@/components/studio/collection/EntryTable';
import { FilterChip } from '@/components/studio/collection/FilterChip';
import { Pagination } from '@/components/studio/collection/Pagination';
import { PageHeader } from '@/components/studio/PageHeader';
import { Button } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Tag } from '@/components/ui/Tag';
import { userRepository } from '@/lib/db/repositories/user';
import { buildListHref, filterAndPaginate, parsePage } from '@/lib/studio/list-query';
import { ROLE_LABEL } from '@/lib/studio/role-label';
import type { User, UserRole } from '@/types/studio';

export const metadata: Metadata = { title: 'Users — HubZero Studio' };

const LIST_PATH = '/studio/settings/users';
const ROLES: UserRole[] = ['headAdmin', 'admin', 'member'];

interface UsersSearchParams {
  q?: string;
  role?: string;
  status?: string;
  page?: string;
  [key: string]: string | undefined;
}

export default async function UsersListPage({
  searchParams,
}: {
  searchParams: Promise<UsersSearchParams>;
}) {
  const params = await searchParams;
  const allUsers = await userRepository.list();

  const result = filterAndPaginate<User>({
    entries: allUsers,
    query: params.q,
    searchFields: (entry) => [entry.name, entry.email],
    predicates: [
      (entry) => (params.role ? entry.role === params.role : true),
      (entry) => {
        if (params.status === 'disabled') return entry.disabled;
        if (params.status === 'active') return !entry.disabled;
        return true;
      },
    ],
    sort: (a, b) => a.name.localeCompare(b.name),
    page: parsePage(params),
  });

  const columns: EntryTableColumn<User>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (entry) => (
        <span className="inline-flex items-center gap-2">
          {entry.name}
          {entry.disabled ? <Tag>Disabled</Tag> : null}
        </span>
      ),
    },
    { key: 'email', header: 'Email', render: (entry) => entry.email },
    { key: 'role', header: 'Role', render: (entry) => ROLE_LABEL[entry.role] },
  ];

  const hasAnyUsers = allUsers.length > 0;
  const hasFiltersApplied = Boolean(params.q || params.role || params.status);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Users"
        description="Studio accounts, roles, and access. Only Head Admin can manage users."
        actions={<ButtonLink href={`${LIST_PATH}/new`}>New user</ButtonLink>}
      />

      <form action={LIST_PATH} method="GET" className="flex gap-2">
        <input type="hidden" name="role" value={params.role ?? ''} />
        <input type="hidden" name="status" value={params.status ?? ''} />
        <Input
          type="search"
          name="q"
          defaultValue={params.q}
          placeholder="Search by name or email…"
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
          href={buildListHref(LIST_PATH, params, { status: 'disabled', page: undefined })}
          active={params.status === 'disabled'}
        >
          Disabled
        </FilterChip>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          href={buildListHref(LIST_PATH, params, { role: undefined, page: undefined })}
          active={!params.role}
        >
          All roles
        </FilterChip>
        {ROLES.map((role) => (
          <FilterChip
            key={role}
            href={buildListHref(LIST_PATH, params, { role, page: undefined })}
            active={params.role === role}
          >
            {ROLE_LABEL[role]}
          </FilterChip>
        ))}
      </div>

      {result.items.length === 0 ? (
        hasAnyUsers ? (
          <EmptyState
            title="No users match your filters."
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
            title="No users yet."
            description="Create the first Studio account to get started."
            action={<ButtonLink href={`${LIST_PATH}/new`}>New user</ButtonLink>}
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
