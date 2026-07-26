import Image from 'next/image';
import Link from 'next/link';
import { PUBLIC_NAVIGATION, PUBLIC_SITE } from '@/config/public-site';
import { publicRoute } from '@/lib/public/routes';

/**
 * The footer is the site's real secondary navigation — the deeper structure
 * a visitor sees once they want it, organized editorially rather than as a
 * mechanical dump of every route. It's the one place Notes and Ledger
 * appear as direct links, since primary navigation deliberately doesn't
 * carry them (Design Specification §5). Sections are hand-composed here,
 * not derived generically from `PUBLIC_NAVIGATION`'s route list, so the
 * grouping stays a deliberate editorial decision instead of drifting to
 * match whatever order the config happens to declare routes in.
 */
const byType = (type: (typeof PUBLIC_NAVIGATION)[number]['type']) =>
  PUBLIC_NAVIGATION.find((item) => item.type === type && item.enabled);

const recordLinks = (['work', 'build', 'blueprint', 'lab', 'note', 'ledger'] as const)
  .map(byType)
  .filter((item): item is NonNullable<typeof item> => Boolean(item));

const companyContentLinks = (['teamMember', 'engineeringProfile'] as const)
  .map(byType)
  .filter((item): item is NonNullable<typeof item> => Boolean(item));

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="public-container public-footer-top">
        <div className="public-footer-brand">
          <div className="public-footer-mark">
            <Image src="/brand/hubzero-logo-white.png" alt="" width={16} height={16} />
            <span>HubZero</span>
          </div>
          <p>Engineering products, systems, and the public record behind them.</p>
        </div>

        {recordLinks.length ? (
          <nav className="public-footer-nav" aria-label="Record">
            <p className="public-footer-nav-heading">Record</p>
            <ul>
              {recordLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        {companyContentLinks.length || PUBLIC_SITE.release.contact ? (
          <nav className="public-footer-nav" aria-label="Company">
            <p className="public-footer-nav-heading">Company</p>
            <ul>
              {companyContentLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
              {PUBLIC_SITE.release.contact ? (
                <li>
                  <Link href={publicRoute.contact({ from: 'footer' })}>Contact</Link>
                </li>
              ) : null}
            </ul>
          </nav>
        ) : null}

        {/*
          Only real destinations — same discipline the footer's "Connect"
          column followed in the product's earlier design generation
          (`dev-legacy`): a link with nothing real behind it is worse than
          no link. RSS appears automatically once `release.feed` flips on;
          no further change needed here when it does. A GitHub entry was
          considered and left out — no organization-level GitHub is
          configured anywhere in `PUBLIC_SITE` today, only per-person and
          per-Build repository links that already live on their own pages.
        */}
        {PUBLIC_SITE.release.search || PUBLIC_SITE.release.feed ? (
          <nav className="public-footer-nav" aria-label="Resources">
            <p className="public-footer-nav-heading">Resources</p>
            <ul>
              {PUBLIC_SITE.release.search ? (
                <li>
                  <Link href={publicRoute.search()}>Search</Link>
                </li>
              ) : null}
              {PUBLIC_SITE.release.feed ? (
                <li>
                  <Link href="/feed.xml">RSS</Link>
                </li>
              ) : null}
            </ul>
          </nav>
        ) : null}
      </div>

      <div className="public-container public-footer-inner">
        <p>© {new Date().getFullYear()} HubZero</p>
        <p>Evidence before claims.</p>
      </div>
    </footer>
  );
}
