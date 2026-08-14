'use client';

import { usePathname } from 'next/navigation';

const FOUNDATIONS: Record<string, { eyebrow: string; title: string }> = {
  '/': { eyebrow: 'Independent technology studio', title: 'We build systems that hold up.' },
  work: { eyebrow: 'Work / documented outcomes', title: 'Work' },
  builds: { eyebrow: 'Builds / shipped products', title: 'Builds' },
  blueprints: { eyebrow: 'Blueprints / reusable foundations', title: 'Blueprints' },
  labs: { eyebrow: 'Labs / active investigations', title: 'Labs' },
  notes: { eyebrow: 'Notes / engineering journal', title: 'Notes' },
  engineering: { eyebrow: 'Engineering / documented practice', title: 'Engineering Profiles' },
  careers: { eyebrow: 'Careers / how we work', title: 'Careers' },
  services: { eyebrow: 'Services / evidence by need', title: 'Services' },
  about: { eyebrow: 'About / operating model', title: 'About HubZero' },
  ledger: { eyebrow: 'Ledger / public activity', title: 'Engineering Ledger' },
  contact: { eyebrow: 'Contact / initial context', title: 'Contact' },
  privacy: { eyebrow: 'Privacy', title: 'Privacy at HubZero' },
  search: { eyebrow: 'Search / published record', title: 'Search HubZero' },
};

export function PublicLoadingState() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const foundation = segments.length <= 1 ? FOUNDATIONS[segments[0] ?? '/'] : undefined;
  const label = foundation?.title ?? 'published record';

  return (
    <main
      id="main-content"
      className="public-loading-main"
      aria-busy="true"
      aria-label={`Loading ${label}`}
    >
      <p className="sr-only" role="status" aria-live="polite">
        Loading {label}.
      </p>
      <header className="public-loading-hero">
        <div className="public-container public-loading-hero-grid">
          <div className="public-loading-copy">
            {foundation ? <p className="home-eyebrow">{foundation.eyebrow}</p> : null}
            {foundation ? (
              <h1>{foundation.title}</h1>
            ) : (
              <div className="public-loading-title" aria-hidden="true">
                <span />
                <span />
              </div>
            )}
            <div className="public-loading-summary" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
          <dl className="public-loading-register" aria-label="Loading publication details">
            <div>
              <dt>Content entries</dt>
              <dd aria-label="Loading content-entry count" />
            </div>
            <div>
              <dt>Technologies</dt>
              <dd aria-label="Loading technology count" />
            </div>
            <div>
              <dt>Record state</dt>
              <dd aria-label="Loading record state" />
            </div>
          </dl>
        </div>
      </header>
      <section className="public-loading-ledger" aria-hidden="true">
        <div className="public-container">
          <div className="public-loading-section-heading" />
          <div className="public-loading-rows">
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>
    </main>
  );
}
