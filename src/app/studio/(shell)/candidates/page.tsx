import type { Metadata } from 'next';
import { EntryTable, type EntryTableColumn } from '@/components/studio/collection/EntryTable';
import { FilterChip } from '@/components/studio/collection/FilterChip';
import { Pagination } from '@/components/studio/collection/Pagination';
import { PageHeader } from '@/components/studio/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tag } from '@/components/ui/Tag';
import { auth } from '@/lib/auth';
import { careerInterestRepository } from '@/lib/db/repositories/career-interest';
import { careerRepository } from '@/lib/db/repositories/career';
import { userRepository } from '@/lib/db/repositories/user';
import { buildListHref, filterAndPaginate, parsePage } from '@/lib/studio/list-query';
import { formatRelativeTime } from '@/lib/utils/relative-time';
import type { CareerInterest, LeadStatus } from '@/types/studio';

export const metadata: Metadata = { title: 'Candidates — HubZero Studio' };

const LIST_PATH = '/studio/candidates';
const STATUSES: LeadStatus[] = ['new', 'contacted', 'closed'];

interface CandidatesSearchParams {
  q?: string;
  status?: string;
  assigned?: string;
  archived?: string;
  page?: string;
  [key: string]: string | undefined;
}

export default async function CandidatesListPage({
  searchParams,
}: {
  searchParams: Promise<CandidatesSearchParams>;
}) {
  const params = await searchParams;
  const session = await auth();
  const role = session?.user.role;
  const userId = session?.user.id;

  const [allCandidatesUnscoped, users, careers] = await Promise.all([
    careerInterestRepository.list(),
    userRepository.list(),
    careerRepository.list(),
  ]);

  // Member sees only what they're assigned — the same scoping the sidebar's
  // `hasAssignedCandidates` check ((shell)/layout.tsx) already decides
  // whether to show Candidates in the nav at all for this role.
  const allCandidates =
    role === 'member'
      ? allCandidatesUnscoped.filter(
          (candidate) => candidate.assignedToUserId?.toString() === userId,
        )
      : allCandidatesUnscoped;

  const userLabel = new Map(users.map((user) => [user._id.toString(), user.name]));
  const careerLabel = new Map(careers.map((career) => [career._id.toString(), career.title]));

  const result = filterAndPaginate<CareerInterest>({
    entries: allCandidates,
    query: params.q,
    searchFields: (entry) => [entry.name, entry.email, entry.introduction],
    predicates: [
      (entry) => (params.status ? entry.status === params.status : true),
      (entry) => (params.assigned ? entry.assignedToUserId?.toString() === params.assigned : true),
      (entry) => {
        if (params.archived === 'true') return entry.archived;
        return !entry.archived;
      },
    ],
    sort: (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    page: parsePage(params),
  });

  const columns: EntryTableColumn<CareerInterest>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (entry) => (
        <span className="inline-flex items-center gap-2">
          {entry.name}
          {entry.archived ? <Tag>Archived</Tag> : null}
        </span>
      ),
    },
    { key: 'email', header: 'Email', render: (entry) => entry.email },
    {
      key: 'career',
      header: 'Interested in',
      render: (entry) =>
        entry.careerId ? (careerLabel.get(entry.careerId.toString()) ?? 'Unknown role') : 'General',
    },
    { key: 'status', header: 'Status', render: (entry) => <Tag>{entry.status}</Tag> },
    {
      key: 'assigned',
      header: 'Assigned to',
      render: (entry) =>
        entry.assignedToUserId
          ? (userLabel.get(entry.assignedToUserId.toString()) ?? 'Unknown')
          : '—',
    },
    {
      key: 'createdAt',
      header: 'Received',
      render: (entry) => (
        <span className="text-text-muted text-xs">{formatRelativeTime(entry.createdAt)}</span>
      ),
    },
  ];

  const hasAnyCandidates = allCandidates.length > 0;
  const hasFiltersApplied = Boolean(
    params.q || params.status || params.assigned || params.archived,
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Candidates"
        description="Interest submitted from the public Careers page — deliberately minimal, not a CRM."
      />

      <form action={LIST_PATH} method="GET" className="flex gap-2">
        <input type="hidden" name="status" value={params.status ?? ''} />
        <input type="hidden" name="assigned" value={params.assigned ?? ''} />
        <input type="hidden" name="archived" value={params.archived ?? ''} />
        <Input
          type="search"
          name="q"
          defaultValue={params.q}
          placeholder="Search by name, email, or introduction…"
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
          All statuses
        </FilterChip>
        {STATUSES.map((status) => (
          <FilterChip
            key={status}
            href={buildListHref(LIST_PATH, params, { status, page: undefined })}
            active={params.status === status}
          >
            {status}
          </FilterChip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          href={buildListHref(LIST_PATH, params, { archived: undefined, page: undefined })}
          active={params.archived !== 'true'}
        >
          Active
        </FilterChip>
        <FilterChip
          href={buildListHref(LIST_PATH, params, { archived: 'true', page: undefined })}
          active={params.archived === 'true'}
        >
          Archived
        </FilterChip>
      </div>

      {result.items.length === 0 ? (
        hasAnyCandidates ? (
          <EmptyState
            title="No candidates match your filters."
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
            title="No candidate interest yet."
            description="Submissions from the public Careers page will show up here as they arrive."
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
