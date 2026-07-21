import type { Metadata } from 'next';
import { LabForm } from '@/components/studio/labs/LabForm';
import { PageHeader } from '@/components/studio/PageHeader';
import { createLabAction } from '@/lib/studio/actions/lab';
import { getLabRelationOptions } from '@/lib/studio/lab-relations';

export const metadata: Metadata = { title: 'New Lab — HubZero Studio' };

/** Every authenticated role holds `createOwnEntry` (§29) — the create action itself is the enforcement point, not this route. */
export default async function NewLabPage() {
  const { technologyOptions, buildOptions, blueprintOptions, contributorOptions } =
    await getLabRelationOptions();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="New Lab"
        description="Starts as a Draft. A reference ID is assigned automatically on save. This is an engineering notebook entry, not a finished product — transparency about direction and progress matters more than polish."
      />
      <LabForm
        action={createLabAction}
        submitLabel="Create Lab"
        technologyOptions={technologyOptions}
        buildOptions={buildOptions}
        blueprintOptions={blueprintOptions}
        contributorOptions={contributorOptions}
      />
    </div>
  );
}
