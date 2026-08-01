import { AlertTriangle } from 'lucide-react';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { listFeaturedCoverageGaps } from '@/lib/studio/featured-collections';

/**
 * Dashboard warning for homepage sections that would render empty while
 * qualifying content sits unfeatured behind them (v3.1 Milestone 2
 * finalization).
 *
 * This is the deliberate alternative to a backfill migration. Inferring an
 * order from publish dates would have silently invented editorial decisions —
 * the one thing the ordering system exists to stop — so the emptiness is left
 * real and made loud instead. An operator cannot deploy the featured-order
 * change and discover an empty homepage afterwards; they see it on the first
 * screen of the Studio, with a link to the screen that fixes it.
 *
 * Renders nothing when there is no gap, so it never becomes background noise.
 */
export async function FeaturedCoverageWarning() {
  const gaps = await listFeaturedCoverageGaps();
  if (gaps.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="featured-coverage-title"
      className="border-danger/40 bg-surface-default rounded-card flex flex-col gap-3 border p-4"
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="text-danger mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <div className="flex flex-col gap-1">
          <h2 id="featured-coverage-title" className="text-text-primary text-sm font-semibold">
            {gaps.length === 1
              ? 'One homepage section is empty'
              : `${gaps.length} homepage sections are empty`}
          </h2>
          <p className="text-text-secondary text-xs">
            Nothing is featured in these collections, so their homepage sections render empty — even
            though there is content that qualifies. Featuring is an editorial choice, so nothing was
            selected automatically.
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {gaps.map((gap) => (
          <li
            key={gap.key}
            className="border-border-muted flex flex-wrap items-center justify-between gap-2 rounded-[4px] border px-3 py-2"
          >
            <span className="text-text-secondary text-sm">
              <span className="text-text-primary font-medium">{gap.label}</span> —{' '}
              {gap.eligibleUnfeatured}{' '}
              {gap.eligibleUnfeatured === 1 ? 'entry qualifies' : 'entries qualify'} for{' '}
              {gap.surface}, none featured.
            </span>
            <ButtonLink href={gap.featuredPath} variant="secondary">
              Choose featured order
            </ButtonLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
