import type { Metadata } from 'next';
import { BlueprintForm } from '@/components/studio/blueprints/BlueprintForm';
import { PageHeader } from '@/components/studio/PageHeader';
import { createBlueprintAction } from '@/lib/studio/actions/blueprint';
import { getBlueprintRelationOptions } from '@/lib/studio/blueprint-relations';

export const metadata: Metadata = { title: 'New Blueprint — HubZero Studio' };

/** Every authenticated role holds `createOwnEntry` (§29) — the create action itself is the enforcement point, not this route. */
export default async function NewBlueprintPage() {
  const { technologyOptions, contributorOptions } = await getBlueprintRelationOptions();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="New Blueprint"
        description="Starts as a Draft. A reference ID is assigned automatically on save. Name must follow the Blueprint-X-Y convention."
      />
      <BlueprintForm
        action={createBlueprintAction}
        submitLabel="Create Blueprint"
        technologyOptions={technologyOptions}
        contributorOptions={contributorOptions}
      />
    </div>
  );
}
