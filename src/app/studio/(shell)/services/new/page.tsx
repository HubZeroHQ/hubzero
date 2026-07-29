import type { Metadata } from 'next';
import { PageHeader } from '@/components/studio/PageHeader';
import { ServiceForm } from '@/components/studio/services/ServiceForm';
import { createServiceAction } from '@/lib/studio/actions/service';
import { getServiceRelationOptions } from '@/lib/studio/service-relations';

export const metadata: Metadata = { title: 'New Service — HubZero Studio' };

export default async function NewServicePage() {
  const relationOptions = await getServiceRelationOptions();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="New Service"
        description="Starts as a Draft. Publish it from the detail page once it's ready."
      />
      <ServiceForm
        action={createServiceAction}
        submitLabel="Create Service"
        relationOptions={relationOptions}
      />
    </div>
  );
}
