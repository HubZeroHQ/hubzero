import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/studio/PageHeader';
import { ServiceForm } from '@/components/studio/services/ServiceForm';
import { serviceRepository } from '@/lib/db/repositories/service';
import { updateServiceAction } from '@/lib/studio/actions/service';
import {
  getServiceRelationOptions,
  splitServiceEvidenceLinks,
} from '@/lib/studio/service-relations';

export const metadata: Metadata = { title: 'Edit Service — HubZero Studio' };

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await serviceRepository.findById(id);
  if (!service) {
    notFound();
  }

  const relationOptions = await getServiceRelationOptions();
  const boundUpdateAction = updateServiceAction.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Edit — ${service.title}`}
        description="Publishing status is managed from the entry's detail view, not here."
      />
      <ServiceForm
        action={boundUpdateAction}
        submitLabel="Save changes"
        initialValues={{
          title: service.title,
          description: service.description,
          order: service.order,
          featured: service.featured,
          ...splitServiceEvidenceLinks(service.evidenceLinks),
        }}
        relationOptions={relationOptions}
      />
    </div>
  );
}
