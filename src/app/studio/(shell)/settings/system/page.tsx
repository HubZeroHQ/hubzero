import type { Metadata } from 'next';
import { PageHeader } from '@/components/studio/PageHeader';
import { StudioSettingsForm } from '@/components/studio/settings/StudioSettingsForm';
import { Tag } from '@/components/ui/Tag';
import { PUBLIC_SITE } from '@/config/public-site';
import { settingsRepository } from '@/lib/db/repositories/settings';
import { publicEnv } from '@/lib/env';
import { updateStudioSettingsAction } from '@/lib/studio/actions/settings';
import { getSystemInfo } from '@/lib/studio/system-info';

export const metadata: Metadata = { title: 'System — HubZero Studio' };

export default async function SystemSettingsPage() {
  const [settings, systemInfo] = await Promise.all([
    settingsRepository.get(),
    Promise.resolve(getSystemInfo()),
  ]);
  const site = publicEnv();
  const features = [
    { label: 'Search', available: PUBLIC_SITE.release.search },
    { label: 'RSS', available: PUBLIC_SITE.release.feed },
    { label: 'Contact form', available: PUBLIC_SITE.release.contact },
  ];
  const integrations = [
    { label: 'Cloudinary', available: systemInfo.cloudinaryConfigured },
    { label: 'Gemini', available: systemInfo.geminiConfigured },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="System"
        description="Operational identity, deployment, capabilities, and connected services for HubZero Studio."
      />

      <section className="border-border-muted bg-surface-default rounded-card border p-6">
        <header className="mb-6 flex flex-col gap-1">
          <h2 className="text-text-primary text-base font-medium">Studio</h2>
          <p className="text-text-muted text-sm">The administrator-managed Studio identity.</p>
        </header>
        <StudioSettingsForm
          action={updateStudioSettingsAction}
          initialValues={{
            studioName: settings.studioName,
            contactEmail: settings.contactEmail,
          }}
        />
      </section>

      <section className="border-border-muted bg-surface-default rounded-card border p-6">
        <header className="mb-6 flex flex-col gap-1">
          <h2 className="text-text-primary text-base font-medium">Deployment</h2>
          <p className="text-text-muted text-sm">The public platform currently deployed.</p>
        </header>
        <dl className="grid gap-6 text-sm sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <dt className="text-text-muted text-xs">Stage</dt>
            <dd className="text-text-primary">{systemInfo.deploymentStage}</dd>
          </div>
          <div className="flex flex-col gap-1.5">
            <dt className="text-text-muted text-xs">Version</dt>
            <dd className="text-text-secondary font-mono text-xs">{systemInfo.version}</dd>
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <dt className="text-text-muted text-xs">Site URL</dt>
            <dd className="text-text-secondary truncate">{site.NEXT_PUBLIC_SITE_URL}</dd>
          </div>
        </dl>
      </section>

      <section className="border-border-muted bg-surface-default rounded-card border p-6">
        <header className="mb-5 flex flex-col gap-1">
          <h2 className="text-text-primary text-base font-medium">Features</h2>
          <p className="text-text-muted text-sm">Availability of public platform capabilities.</p>
        </header>
        <ul className="divide-border-muted divide-y" aria-label="Feature availability">
          {features.map((feature) => (
            <li
              key={feature.label}
              className="flex min-h-12 items-center justify-between gap-4 py-3"
            >
              <span className="text-text-secondary text-sm">{feature.label}</span>
              <Tag>{feature.available ? 'Available' : 'Unavailable'}</Tag>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-border-muted bg-surface-default rounded-card border p-6">
        <header className="mb-5 flex flex-col gap-1">
          <h2 className="text-text-primary text-base font-medium">Integrations</h2>
          <p className="text-text-muted text-sm">Operational availability of connected services.</p>
        </header>
        <ul className="divide-border-muted divide-y" aria-label="Integration availability">
          {integrations.map((integration) => (
            <li
              key={integration.label}
              className="flex min-h-12 items-center justify-between gap-4 py-3"
            >
              <span className="text-text-secondary text-sm">{integration.label}</span>
              <Tag>{integration.available ? 'Available' : 'Unavailable'}</Tag>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
