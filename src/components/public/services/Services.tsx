import Link from 'next/link';
import { PUBLIC_ENTITY_ROUTES, PUBLIC_SERVICES } from '@/config/public-site';
import type { ImmutablePublic, PublicServiceSummary } from '@/lib/public/domain';
import { PageContainer, PublicSection } from '../PageContainer';

export function Services({
  services,
}: {
  services: readonly ImmutablePublic<PublicServiceSummary>[];
}) {
  const evidenceCount = services.reduce((total, service) => total + service.evidence.length, 0);

  return (
    <main id="main-content" tabIndex={-1} className="collection-main services-main">
      <header className="services-hero">
        <PageContainer className="services-hero-grid">
          <div className="services-hero-copy">
            <p className="home-eyebrow">{PUBLIC_SERVICES.eyebrow}</p>
            <h1>
              {PUBLIC_SERVICES.title.lead} <em>{PUBLIC_SERVICES.title.emphasis}</em>{' '}
              {PUBLIC_SERVICES.title.close}
            </h1>
            <p>{PUBLIC_SERVICES.introduction}</p>
          </div>
          <dl className="services-register" aria-label="Services publication metadata">
            <div>
              <dt>Published services</dt>
              <dd>{services.length}</dd>
            </div>
            <div>
              <dt>Public evidence</dt>
              <dd>{evidenceCount}</dd>
            </div>
            <div>
              <dt>Standard</dt>
              <dd>Evidence before claims</dd>
            </div>
          </dl>
        </PageContainer>
      </header>

      <PublicSection className="services-build" aria-labelledby="services-build-title">
        <PageContainer>
          <header className="services-section-heading">
            <p className="home-eyebrow">What HubZero builds / working systems</p>
            <h2 id="services-build-title">Capability is a consequence of the work.</h2>
            <p>
              These areas describe the systems HubZero can work on. Published service definitions
              below connect that capability to the public record that supports it.
            </p>
          </header>
          <ol className="services-build-ledger">
            {PUBLIC_SERVICES.buildAreas.map((area, index) => (
              <li key={area.label}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{area.label}</h3>
                <p>{area.description}</p>
              </li>
            ))}
          </ol>
        </PageContainer>
      </PublicSection>

      <PublicSection className="services-evidence" aria-labelledby="services-evidence-title">
        <PageContainer>
          <header className="services-section-heading services-section-heading-wide">
            <p className="home-eyebrow">Published services / evidence by need</p>
            <h2 id="services-evidence-title">Definitions supported by public artifacts.</h2>
            <p>
              Evidence may come from client work, shipped products, active investigations, reusable
              foundations, or engineering notes. Editorial judgment determines whether the record
              supports the definition.
            </p>
          </header>

          {services.length ? (
            <ol className="services-evidence-ledger">
              {services.map((service, index) => (
                <li key={service.title}>
                  <article>
                    <div className="services-evidence-definition">
                      <p className="home-eyebrow">Service / {String(index + 1).padStart(2, '0')}</p>
                      <h3>{service.title}</h3>
                      <p>{service.summary}</p>
                      <p className="services-boundary-note">
                        This definition is limited to the evidence connected here.
                      </p>
                    </div>
                    <nav aria-label={`${service.title} evidence`}>
                      <p className="home-eyebrow">Proven by / {service.evidence.length}</p>
                      <ul>
                        {service.evidence.map((relationship) => (
                          <li key={`${relationship.kind}-${relationship.target.url}`}>
                            <span>{relationship.target.type}</span>
                            {PUBLIC_ENTITY_ROUTES[relationship.target.type] ? (
                              <Link href={relationship.target.url}>
                                {relationship.target.title} <span aria-hidden="true">↗</span>
                              </Link>
                            ) : (
                              <span>{relationship.target.title}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </article>
                </li>
              ))}
            </ol>
          ) : (
            <section
              className="collection-empty services-empty"
              aria-labelledby="services-empty-title"
            >
              <p className="home-eyebrow">Services / no eligible public definitions</p>
              <h3 id="services-empty-title">The engineering approach remains the useful record.</h3>
              <p>
                Service definitions appear only when published Studio content is supported by
                sufficient visible evidence. Nothing is added here to fill a catalogue.
              </p>
            </section>
          )}
        </PageContainer>
      </PublicSection>

      <PublicSection className="services-engagement" aria-labelledby="services-engagement-title">
        <PageContainer>
          <header className="services-section-heading">
            <p className="home-eyebrow">Engagement shapes / fit before format</p>
            <h2 id="services-engagement-title">The shape follows the uncertainty.</h2>
          </header>
          <div className="services-engagement-grid">
            {PUBLIC_SERVICES.engagementModels.map((model) => (
              <article key={model.title}>
                <h3>{model.title}</h3>
                <p>{model.body}</p>
              </article>
            ))}
          </div>
        </PageContainer>
      </PublicSection>

      <PublicSection className="services-process" aria-labelledby="services-process-title">
        <PageContainer>
          <header className="services-section-heading">
            <p className="home-eyebrow">Engineering process / visible decisions</p>
            <h2 id="services-process-title">A complete path from context to continuity.</h2>
          </header>
          <ol className="services-process-ledger">
            {PUBLIC_SERVICES.process.map((step, index) => (
              <li key={step.label}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{step.label}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </PageContainer>
      </PublicSection>

      <footer className="services-close">
        <PageContainer className="services-close-grid">
          <div>
            <p className="home-eyebrow">Collaboration / shared context</p>
            <h2>{PUBLIC_SERVICES.collaboration.title}</h2>
            <p>{PUBLIC_SERVICES.collaboration.body}</p>
          </div>
          <div>
            <ul aria-label="Collaboration boundaries">
              {PUBLIC_SERVICES.collaboration.boundaries.map((boundary) => (
                <li key={boundary}>{boundary}</li>
              ))}
            </ul>
            <Link href="/contact?from=services">
              Start with the problem <span aria-hidden="true">→</span>
            </Link>
          </div>
        </PageContainer>
      </footer>
    </main>
  );
}
