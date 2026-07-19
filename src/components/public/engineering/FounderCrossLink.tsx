import Link from 'next/link';
import type { ReactNode } from 'react';
import { founderAccentStyle, getFounderIdentity } from '@/config/founder-identity';
import type { PublicTaxonomyTerm } from '@/lib/public/domain';
import { FounderMotif } from './motifs';
import { slugFromProfileUrl } from './profile-url';

/**
 * The consistent cross-site treatment for a founder's name wherever it
 * appears outside their own profile (Notes byline today; any future
 * surface with the same author/contributor shape reuses this rather than
 * inventing another one-off link). A founder gets accent color + a
 * miniature motif glyph, built from their own real technologies when that
 * data is present — never a placeholder diagram. Anyone without a designed
 * identity (or without technology data attached) falls back to a plain
 * link, unchanged from today's behavior.
 */
export function FounderCrossLink({
  href,
  children,
  technologies,
}: {
  href: string;
  children: ReactNode;
  technologies?: readonly PublicTaxonomyTerm[];
}) {
  const slug = slugFromProfileUrl(href);
  const identity = slug ? getFounderIdentity(slug) : undefined;

  if (!identity) {
    return <Link href={href}>{children}</Link>;
  }

  return (
    <span className="founder-cross-link" style={founderAccentStyle(identity.accent)}>
      {technologies?.length ? (
        <FounderMotif
          className="founder-motif-compact founder-motif-mini"
          motif={identity.motif}
          technologies={technologies}
          description={identity.motifDescription}
        />
      ) : null}
      <Link href={href}>{children}</Link>
    </span>
  );
}
