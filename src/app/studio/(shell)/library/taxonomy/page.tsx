import type { Metadata } from 'next';
import { EntryTable, type EntryTableColumn } from '@/components/studio/collection/EntryTable';
import { FilterChip } from '@/components/studio/collection/FilterChip';
import { Pagination } from '@/components/studio/collection/Pagination';
import { MergeTaxonomyDialog } from '@/components/studio/taxonomy/MergeTaxonomyDialog';
import { PageHeader } from '@/components/studio/PageHeader';
import { Button } from '@/components/ui/Button';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Tag } from '@/components/ui/Tag';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import { mergeTaxonomyEntriesAction } from '@/lib/studio/actions/taxonomy';
import { buildListHref, filterAndPaginate, parsePage } from '@/lib/studio/list-query';
import { totalTaxonomyUsage } from '@/lib/studio/safeguards/taxonomy';
import type { TaxonomyEntry, TaxonomyKind } from '@/types/studio';

export const metadata: Metadata = { title: 'Taxonomy — HubZero Studio' };

const LIST_PATH = '/studio/library/taxonomy';
const KINDS: TaxonomyKind[] = ['technology', 'category', 'topic'];

interface TaxonomySearchParams {
  q?: string;
  kind?: string;
  page?: string;
  [key: string]: string | undefined;
}

export default async function TaxonomyListPage({
  searchParams,
}: {
  searchParams: Promise<TaxonomySearchParams>;
}) {
  const params = await searchParams;
  const allEntries = await taxonomyRepository.list();

  const result = filterAndPaginate<TaxonomyEntry>({
    entries: allEntries,
    query: params.q,
    searchFields: (entry) => [entry.label, entry.slug],
    predicates: [(entry) => (params.kind ? entry.kind === params.kind : true)],
    sort: (a, b) => a.kind.localeCompare(b.kind) || a.label.localeCompare(b.label),
    page: parsePage(params),
  });

  const usageByEntry = new Map(
    await Promise.all(
      result.items.map(
        async (entry) =>
          [entry._id.toString(), await totalTaxonomyUsage(entry._id.toString())] as const,
      ),
    ),
  );

  const columns: EntryTableColumn<TaxonomyEntry>[] = [
    { key: 'label', header: 'Label', render: (entry) => entry.label },
    { key: 'kind', header: 'Kind', render: (entry) => <Tag>{entry.kind}</Tag> },
    { key: 'slug', header: 'Slug', render: (entry) => entry.slug },
    {
      key: 'usage',
      header: 'Used by',
      render: (entry) => {
        const count = usageByEntry.get(entry._id.toString()) ?? 0;
        return <span className="text-text-muted text-sm">{count}</span>;
      },
    },
  ];

  const hasAnyEntries = allEntries.length > 0;
  const hasFiltersApplied = Boolean(params.q || params.kind);
  const mergeOptions = allEntries.map((entry) => ({
    id: entry._id.toString(),
    label: entry.label,
    kind: entry.kind,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Taxonomy"
        description="Shared Technologies, Categories, and Tags — the single source of truth used across every Studio collection."
        actions={
          <div className="flex gap-2">
            {mergeOptions.length > 1 ? (
              <MergeTaxonomyDialog options={mergeOptions} action={mergeTaxonomyEntriesAction} />
            ) : null}
            <ButtonLink href={`${LIST_PATH}/new`}>New entry</ButtonLink>
          </div>
        }
      />

      <form action={LIST_PATH} method="GET" className="flex gap-2">
        <input type="hidden" name="kind" value={params.kind ?? ''} />
        <Input
          type="search"
          name="q"
          defaultValue={params.q}
          placeholder="Search by label or slug…"
          className="max-w-sm"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          href={buildListHref(LIST_PATH, params, { kind: undefined, page: undefined })}
          active={!params.kind}
        >
          All kinds
        </FilterChip>
        {KINDS.map((kind) => (
          <FilterChip
            key={kind}
            href={buildListHref(LIST_PATH, params, { kind, page: undefined })}
            active={params.kind === kind}
          >
            {kind}
          </FilterChip>
        ))}
      </div>

      {result.items.length === 0 ? (
        hasAnyEntries ? (
          <EmptyState
            title="No entries match your filters."
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
            title="No Taxonomy entries yet."
            description="Create the first Technology, Category, or Tag."
            action={<ButtonLink href={`${LIST_PATH}/new`}>New entry</ButtonLink>}
          />
        )
      ) : (
        <>
          <EntryTable
            entries={result.items}
            columns={columns}
            getRowHref={(entry) => `${LIST_PATH}/${entry._id.toString()}/edit`}
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
