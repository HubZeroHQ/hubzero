import Link from 'next/link';
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';

const LINKS = [
  { href: 'https://github.com/HubZeroHQ', label: 'GitHub', icon: FiGithub, external: true },
  {
    href: 'https://www.linkedin.com/company/hubzerohq',
    label: 'LinkedIn',
    icon: FiLinkedin,
    external: true,
  },
  { href: '/contact', label: 'Contact', icon: FiMail, external: false },
];

export default function ComingSoonFooter() {
  return (
    <footer className="border-t border-[var(--border-muted)] bg-[var(--bg)] px-6 py-10 text-[var(--text-muted)]">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} HubZero. Full site returning soon.
        </p>

        <div className="flex items-center gap-6">
          {LINKS.map(({ href, label, icon: Icon, external }) =>
            external ? (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm transition hover:text-[var(--text)]"
              >
                <Icon aria-hidden="true" />
                {label}
              </a>
            ) : (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-2 text-sm transition hover:text-[var(--text)]"
              >
                <Icon aria-hidden="true" />
                {label}
              </Link>
            )
          )}
        </div>
      </div>
    </footer>
  );
}
