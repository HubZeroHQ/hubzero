import type { Metadata } from 'next';
import { CareerForm } from '@/components/studio/careers/CareerForm';
import { PageHeader } from '@/components/studio/PageHeader';
import { createCareerAction } from '@/lib/studio/actions/career';
import { getCareerRelationOptions } from '@/lib/studio/career-relations';

export const metadata: Metadata = { title: 'New Career listing — HubZero Studio' };

/** Every authenticated role holds `createOwnEntry` (§29) — the create action itself is the enforcement point, not this route. */
export default async function NewCareerPage() {
  const relationOptions = await getCareerRelationOptions();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="New Career listing"
        description="Starts as a Draft. A reference ID is assigned automatically on save."
      />
      <CareerForm
        action={createCareerAction}
        submitLabel="Create Career listing"
        initialValues={{
          title: '',
          slug: '',
          location: '',
          employmentType: 'fullTime',
          experienceLevel: 'mid',
          summary: '',
          responsibilities: [],
          requirements: [],
          benefits: [],
          applicationProcess: '',
          technologyIds: [],
          relatedWorkIds: [],
          relatedBuildIds: [],
          relatedLabIds: [],
          relatedNoteIds: [],
        }}
        {...relationOptions}
      />
    </div>
  );
}
