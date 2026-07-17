import type { Metadata } from 'next';
import { EntryTable, type EntryTableColumn } from '@/components/studio/collection/EntryTable';
import { FilterChip } from '@/components/studio/collection/FilterChip';
import { Pagination } from '@/components/studio/collection/Pagination';
import { PageHeader } from '@/components/studio/PageHeader';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { ReferenceIdBadge } from '@/components/ui/ReferenceIdBadge';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { PUBLISH_WORKFLOW_ORDER } from '@/config/workflow';
import { engineeringProfileRepository } from '@/lib/db/repositories/engineering-profile';
import { teamRepository } from '@/lib/db/repositories/team';
import { buildListHref, filterAndPaginate, parsePage } from '@/lib/studio/list-query';
import type { EngineeringProfile } from '@/types/studio';

export const metadata: Metadata = { title: 'Engineering Profiles — HubZero Studio' };
const PATH = '/studio/engineering-profiles';
export default async function EngineeringProfilesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const [entries, team] = await Promise.all([
    engineeringProfileRepository.list(),
    teamRepository.list(),
  ]);
  const names = new Map(team.map((t) => [t._id.toString(), t.name]));
  const result = filterAndPaginate({
    entries,
    query: params.q,
    searchFields: (e) => [
      names.get(e.teamMemberId.toString()) ?? '',
      e.referenceId,
      e.overview,
      e.engineeringPhilosophy,
      e.currentExploration,
      ...e.areasOfExpertise,
    ],
    predicates: [(e) => (params.status ? e.status === params.status : true)],
    sort: (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    page: parsePage(params),
  });
  const columns: EntryTableColumn<EngineeringProfile>[] = [
    {
      key: 'name',
      header: 'Engineer',
      render: (e) => names.get(e.teamMemberId.toString()) ?? 'Unknown team member',
    },
    {
      key: 'referenceId',
      header: 'Reference ID',
      render: (e) => <ReferenceIdBadge referenceId={e.referenceId} />,
    },
    { key: 'status', header: 'Status', render: (e) => <StatusIndicator status={e.status} /> },
    {
      key: 'exploration',
      header: 'Current exploration',
      render: (e) => (
        <span className="text-text-secondary line-clamp-1">{e.currentExploration}</span>
      ),
    },
  ];
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Engineering Profiles"
        description="Earned records of how HubZero engineers think, decide, and build. Separate from Team membership by design."
        actions={<ButtonLink href={`${PATH}/new`}>New Engineering Profile</ButtonLink>}
      />
      <form action={PATH} className="flex gap-2">
        <input type="hidden" name="status" value={params.status ?? ''} />
        <Input
          name="q"
          type="search"
          defaultValue={params.q}
          placeholder="Search name, EP ID, expertise, exploration…"
        />
        <button className="border-border-default rounded-control border px-4 text-sm">
          Search
        </button>
      </form>
      <div className="flex flex-wrap gap-2">
        <FilterChip
          href={buildListHref(PATH, params, { status: undefined })}
          active={!params.status}
        >
          All
        </FilterChip>
        {PUBLISH_WORKFLOW_ORDER.map((s) => (
          <FilterChip
            key={s}
            href={buildListHref(PATH, params, { status: s })}
            active={params.status === s}
          >
            {s}
          </FilterChip>
        ))}
      </div>
      {result.items.length ? (
        <>
          <EntryTable
            entries={result.items}
            columns={columns}
            getRowHref={(e) => `${PATH}/${e._id}`}
            getRowKey={(e) => e._id.toString()}
          />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            buildHref={(page) => buildListHref(PATH, params, { page })}
          />
        </>
      ) : (
        <EmptyState
          title="No Engineering Profiles yet."
          description="Create one when an engineer has enough evidence and perspective to earn it."
          action={<ButtonLink href={`${PATH}/new`}>New Engineering Profile</ButtonLink>}
        />
      )}
    </div>
  );
}
