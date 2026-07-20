import type { Metadata } from 'next';
import { StudioSettingsForm } from '@/components/studio/settings/StudioSettingsForm';
import { PageHeader } from '@/components/studio/PageHeader';
import { Tag } from '@/components/ui/Tag';
import { PUBLIC_SITE } from '@/config/public-site';
import { publicEnv } from '@/lib/env';
import { settingsRepository } from '@/lib/db/repositories/settings';
import { updateStudioSettingsAction } from '@/lib/studio/actions/settings';
import { getSystemInfo } from '@/lib/studio/system-info';

export const metadata: Metadata = { title: 'System — HubZero Studio' };

export default async function SystemSettingsPage() {
  const [settings, systemInfo] = await Promise.all([
    settingsRepository.get(),
    Promise.resolve(getSystemInfo()),
  ]);
  const site = publicEnv();

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="System"
        description="Studio branding is editable below. Everything else on this page is read-only, derived directly from deployment configuration."
      />

      <section className="flex flex-col gap-4">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
          Studio information &amp; branding
        </h2>
        <StudioSettingsForm
          action={updateStudioSettingsAction}
          initialValues={{
            studioName: settings.studioName,
            tagline: settings.tagline,
            contactEmail: settings.contactEmail,
            accentColor: settings.accentColor,
          }}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
          Public website
        </h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-text-muted text-xs">Site URL</dt>
            <dd className="text-text-secondary">{site.NEXT_PUBLIC_SITE_URL}</dd>
          </div>
          <div>
            <dt className="text-text-muted text-xs">Site name</dt>
            <dd className="text-text-secondary">{PUBLIC_SITE.name}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-text-muted text-xs">Public release status</dt>
            <dd className="mt-1 flex flex-wrap gap-2">
              <Tag>{PUBLIC_SITE.release.live ? 'Live' : 'Not live'}</Tag>
              <Tag>{PUBLIC_SITE.release.search ? 'Search on' : 'Search off'}</Tag>
              <Tag>{PUBLIC_SITE.release.feed ? 'Feed on' : 'Feed off'}</Tag>
              <Tag>{PUBLIC_SITE.release.contact ? 'Contact form on' : 'Contact form off'}</Tag>
            </dd>
          </div>
        </dl>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
          Environment &amp; build
        </h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-text-muted text-xs">Environment</dt>
            <dd className="text-text-secondary">{systemInfo.nodeEnv}</dd>
          </div>
          <div>
            <dt className="text-text-muted text-xs">Version</dt>
            <dd className="text-text-secondary">{systemInfo.version}</dd>
          </div>
          {systemInfo.commitSha ? (
            <div>
              <dt className="text-text-muted text-xs">Commit</dt>
              <dd className="text-text-secondary font-mono text-xs">
                {systemInfo.commitSha.slice(0, 12)}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
          Integrations
        </h2>
        <p className="text-text-muted text-xs">
          Configuration presence only — never secret values.
        </p>
        <div className="flex flex-wrap gap-2">
          <Tag>
            {systemInfo.cloudinaryConfigured
              ? 'Cloudinary configured'
              : 'Cloudinary not configured'}
          </Tag>
          <Tag>{systemInfo.geminiConfigured ? 'Gemini configured' : 'Gemini not configured'}</Tag>
        </div>
      </section>
    </div>
  );
}
