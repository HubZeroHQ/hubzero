import Image from 'next/image';
import Link from 'next/link';
import { PUBLIC_NAVIGATION, PUBLIC_SITE } from '@/config/public-site';

const contentLinks = PUBLIC_NAVIGATION.filter(
  (item) => item.type !== 'teamMember' && item.type !== 'service' && item.enabled,
);
const studioLinks = PUBLIC_NAVIGATION.filter(
  (item) => (item.type === 'teamMember' || item.type === 'service') && item.enabled,
);

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

        {contentLinks.length ? (
          <nav className="public-footer-nav" aria-label="Public record">
            <p className="public-footer-nav-heading">Record</p>
            <ul>
              {contentLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        {studioLinks.length || PUBLIC_SITE.release.contact ? (
          <nav className="public-footer-nav" aria-label="Studio">
            <p className="public-footer-nav-heading">Studio</p>
            <ul>
              {studioLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
              {PUBLIC_SITE.release.contact ? (
                <li>
                  <Link href="/contact?from=footer">Contact</Link>
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
