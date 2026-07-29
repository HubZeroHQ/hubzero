import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ConfirmActionDialog } from '@/components/studio/ConfirmActionDialog';
import { PageHeader } from '@/components/studio/PageHeader';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Button } from '@/components/ui/Button';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { Tag } from '@/components/ui/Tag';
import { serviceRepository } from '@/lib/db/repositories/service';
import { deleteServiceAction, setServiceStatusAction } from '@/lib/studio/actions/service';
import { getServiceRelationOptions } from '@/lib/studio/service-relations';

export const metadata: Metadata = { title: 'Service — HubZero Studio' };

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await serviceRepository.findById(id);
  if (!service) {
    notFound();
  }

  const relationOptions = await getServiceRelationOptions();
  const optionsByType = {
    Work: relationOptions.workOptions,
    Build: relationOptions.buildOptions,
    Blueprint: relationOptions.blueprintOptions,
    Lab: relationOptions.labOptions,
    Note: relationOptions.noteOptions,
  } as const;

  const boundDelete = deleteServiceAction.bind(null, id);
  const nextStatus = service.status === 'draft' ? 'published' : 'draft';

  async function toggleStatusAction() {
    'use server';
    await setServiceStatusAction(id, nextStatus);
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={service.title}
        actions={
          <ButtonLink href={`/studio/services/${id}/edit`} variant="secondary">
            Edit
          </ButtonLink>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <StatusIndicator status={service.status} />
        {service.featured ? <Tag>Featured</Tag> : null}
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
          Description
        </h2>
        <p className="text-text-secondary text-sm whitespace-pre-line">{service.description}</p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
          Evidence links
        </h2>
        {service.evidenceLinks.length === 0 ? (
          <p className="text-text-muted text-sm">None linked yet.</p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {service.evidenceLinks.map((link) => {
              const option = optionsByType[link.ownerType].find(
                (candidate) => candidate.id === link.ownerId.toString(),
              );
              return (
                <li
                  key={`${link.ownerType}-${link.ownerId.toString()}`}
                  className="text-text-secondary"
                >
                  {link.ownerType}: {option?.label ?? 'Unknown'}
                  {option?.referenceId ? ` (${option.referenceId})` : ''}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <form action={toggleStatusAction}>
          <Button type="submit" variant="secondary">
            {service.status === 'draft' ? 'Publish' : 'Move to draft'}
          </Button>
        </form>
        <ConfirmActionDialog
          triggerLabel="Delete"
          title="Delete this Service?"
          description="This permanently removes the record. This cannot be undone."
          confirmLabel="Delete"
          action={boundDelete}
        />
      </div>
    </div>
  );
}
