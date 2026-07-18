import { PUBLIC_CONTACT } from '@/config/public-site';
import { describeContactSource } from '@/lib/public/contact';
import { PageContainer } from '../PageContainer';
import { ContactForm } from './ContactForm';

export function Contact({ source, startedAt }: { source: string; startedAt: number }) {
  return (
    <main id="main-content" tabIndex={-1} className="collection-main contact-main">
      <header className="contact-hero">
        <PageContainer className="contact-hero-grid">
          <div className="contact-hero-copy">
            <p className="home-eyebrow">{PUBLIC_CONTACT.eyebrow}</p>
            <h1>
              {PUBLIC_CONTACT.title.lead} <em>{PUBLIC_CONTACT.title.emphasis}</em>{' '}
              {PUBLIC_CONTACT.title.close}
            </h1>
            <p>{PUBLIC_CONTACT.introduction}</p>
          </div>
          <dl className="contact-register" aria-label="Contact expectations">
            <div>
              <dt>Required</dt>
              <dd>Name, email, and initial context</dd>
            </div>
            <div>
              <dt>Starting point</dt>
              <dd>{describeContactSource(source)}</dd>
            </div>
            <div>
              <dt>Next</dt>
              <dd>Careful review, then discussion when useful</dd>
            </div>
          </dl>
        </PageContainer>
      </header>

      <section className="contact-brief" aria-labelledby="contact-form-title">
        <PageContainer className="contact-brief-grid">
          <header>
            <p className="home-eyebrow">Initial brief / three fields</p>
            <h2 id="contact-form-title">Enough context to understand the problem.</h2>
            <p>{PUBLIC_CONTACT.reviewStatement}</p>
          </header>
          <ContactForm source={source} startedAt={startedAt} />
        </PageContainer>
      </section>
    </main>
  );
}
