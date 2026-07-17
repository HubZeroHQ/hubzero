import { EngineeringProfileForm } from '@/components/studio/engineering-profiles/EngineeringProfileForm';
import { PageHeader } from '@/components/studio/PageHeader';
import { createEngineeringProfileAction } from '@/lib/studio/actions/engineering-profile';
import { getEngineeringProfileRelationOptions } from '@/lib/studio/engineering-profile-relations';
export default async function NewEngineeringProfilePage() {
  const options = await getEngineeringProfileRelationOptions();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="New Engineering Profile"
        description="Starts as a Draft. EP identifiers are permanent and assigned on save. A Team Member may have at most one profile."
      />
      <EngineeringProfileForm
        action={createEngineeringProfileAction}
        submitLabel="Create Engineering Profile"
        {...options}
      />
    </div>
  );
}
