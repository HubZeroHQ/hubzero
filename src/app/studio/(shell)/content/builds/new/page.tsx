import type { Metadata } from 'next';
import { BuildForm } from '@/components/studio/builds/BuildForm';
import { PageHeader } from '@/components/studio/PageHeader';
import { createBuildAction } from '@/lib/studio/actions/build';
import { getBuildRelationOptions } from '@/lib/studio/build-relations';

export const metadata: Metadata = { title: 'New Build — HubZero Studio' };

/** Every authenticated role holds `createOwnEntry` (§29) — the create action itself is the enforcement point, not this route. */
export default async function NewBuildPage() {
  const { technologyOptions, labOptions, workOptions } = await getBuildRelationOptions();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="New Build"
        description="Starts as a Draft. A reference ID is assigned automatically on save (§27)."
      />
      <BuildForm
        action={createBuildAction}
        submitLabel="Create Build"
        technologyOptions={technologyOptions}
        labOptions={labOptions}
        workOptions={workOptions}
      />
    </div>
  );
}
