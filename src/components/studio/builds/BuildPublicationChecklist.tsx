import type { BuildPublicationCheck, PublicSurface } from '@/lib/public/eligibility';
import { cn } from '@/lib/utils/cn';

const SURFACE_LABEL: Record<PublicSurface, string> = {
  index: 'Builds index',
  detail: 'its own detail page',
  homepage: 'the homepage Featured Builds section',
  search: 'search',
  relationships: 'relationship / evidence links on other entries',
};

function surfaceList(surfaces: readonly PublicSurface[]): string {
  return surfaces.map((surface) => SURFACE_LABEL[surface]).join(', ');
}

/**
 * Renders the exact contract `repository.ts` enforces for a Build
 * (`lib/public/eligibility.ts`) — never a Studio-only approximation of it.
 * Editors have historically had no way to tell "Featured is on" from
 * "Featured actually reaches the homepage" apart from checking the live
 * site; this makes every gate that stands between the two visible here.
 */
export function BuildPublicationChecklist({
  checks,
}: {
  checks: readonly BuildPublicationCheck[];
}) {
  const failing = checks.filter((check) => !check.passed);
  const excludedSurfaces = [
    ...new Set(failing.flatMap((check) => check.affectedSurfaces)),
  ] as PublicSurface[];

  return (
    <section className="border-border-default rounded-card flex flex-col gap-3 border p-4">
      <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
        Publication readiness
      </h2>

      <ul className="flex flex-col gap-2.5">
        {checks.map((check) => (
          <li key={check.id} className="flex items-start gap-2.5 text-sm">
            <span
              aria-hidden
              className={cn(
                'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                check.passed ? 'bg-success' : 'bg-danger',
              )}
            />
            <div className="flex flex-col">
              <span className={check.passed ? 'text-text-secondary' : 'text-text-primary'}>
                {check.label}
              </span>
              {!check.passed ? (
                <span className="text-text-muted text-xs">
                  Missing — keeps this Build out of {surfaceList(check.affectedSurfaces)}.
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {excludedSurfaces.length === 0 ? (
        <p className="text-success text-xs">
          Every publication requirement is met — eligible for every public surface.
        </p>
      ) : (
        <p className="text-text-muted text-xs">
          Currently excluded from: {surfaceList(excludedSurfaces)}.
        </p>
      )}
    </section>
  );
}
