import { PUBLIC_PRIVACY } from '@/config/public-site';
import { PageContainer } from '../PageContainer';

export function Privacy() {
  return (
    <main id="main-content" tabIndex={-1} className="collection-main privacy-main">
      <header className="privacy-hero">
        <PageContainer>
          <p className="home-eyebrow">{PUBLIC_PRIVACY.eyebrow}</p>
          <h1>{PUBLIC_PRIVACY.title}</h1>
          <p>{PUBLIC_PRIVACY.introduction}</p>
          <p className="privacy-updated">Last updated {PUBLIC_PRIVACY.lastUpdated}</p>
        </PageContainer>
      </header>

      <section className="privacy-body" aria-label="Privacy policy">
        <PageContainer className="privacy-sections">
          {PUBLIC_PRIVACY.sections.map((section) => (
            <article key={section.heading}>
              <h2>{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>
          ))}
        </PageContainer>
      </section>
    </main>
  );
}
