import type { Metadata } from 'next';
import { WorkForm } from '@/components/studio/work/WorkForm';
import { PageHeader } from '@/components/studio/PageHeader';
import { createWorkAction } from '@/lib/studio/actions/work';
import { getWorkRelationOptions } from '@/lib/studio/work-relations';

export const metadata: Metadata = { title: 'New Work entry — HubZero Studio' };

/** Every authenticated role holds `createOwnEntry` (§29) — the create action itself is the enforcement point, not this route. */
export default async function NewWorkPage() {
  const {
    categoryOptions,
    technologyOptions,
    buildOptions,
    blueprintOptions,
    labOptions,
    contributorOptions,
  } = await getWorkRelationOptions();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="New Work entry"
        description="Starts as a Draft. A reference ID is assigned automatically on save (§27)."
      />
      <WorkForm
        action={createWorkAction}
        submitLabel="Create Work entry"
        categoryOptions={categoryOptions}
        technologyOptions={technologyOptions}
        buildOptions={buildOptions}
        blueprintOptions={blueprintOptions}
        labOptions={labOptions}
        contributorOptions={contributorOptions}
      />
    </div>
  );
}
