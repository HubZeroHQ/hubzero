/**
 * The Founder Engineering Identity System (Phase 23) — a deliberate, scoped
 * exception to DESIGN_SYSTEM.md's single-amber-accent rule. It applies only
 * to a founder's own Engineering Profile route and the About founder card
 * that leads into it; every other public surface stays monochrome + amber.
 * See ENGINEERING_IDENTITY.md's "Founder accent exception" note.
 *
 * This is static, hand-authored, and permanent by design (PUBLIC brief:
 * "the visual identity should never be editable — only editorial content
 * evolves"). It is keyed by the Team/EngineeringProfile `slug`, not stored
 * in Studio, and deliberately does not cover every possible future profile —
 * a profile with no entry here renders through the generic template, which
 * is exactly how a future non-founder Engineering Profile should behave
 * until leadership deliberately designs an identity for them.
 */

export type FounderMotifId = 'network' | 'dependencyGraph' | 'curve' | 'editorialGrid' | 'pcbTrace';

export interface FounderIdentity {
  slug: string;
  accent: string;
  motif: FounderMotifId;
  /** Accessible description of what the motif diagrams — read by screen readers, never decorative alt text. */
  motifDescription: string;
}

export const FOUNDER_IDENTITIES: readonly FounderIdentity[] = [
  {
    slug: 'rifaque',
    accent: '#4d8dff',
    motif: 'network',
    motifDescription: 'A network of connected systems radiating from a central node.',
  },
  {
    slug: 'raif',
    accent: '#22d3ee',
    motif: 'dependencyGraph',
    motifDescription: 'A layered dependency graph connecting foundational systems upward.',
  },
  {
    slug: 'iyad',
    accent: '#a78bfa',
    motif: 'curve',
    motifDescription: 'A continuous curve connecting stages of a product lifecycle.',
  },
  {
    slug: 'sultan',
    accent: '#f5943b',
    motif: 'editorialGrid',
    motifDescription: 'An editorial grid structuring topics into a documentation outline.',
  },
  {
    slug: 'salsabeel',
    accent: '#34d399',
    motif: 'pcbTrace',
    motifDescription: 'Right-angled circuit traces routing between component pads.',
  },
] as const;

export function getFounderIdentity(slug: string): FounderIdentity | undefined {
  return FOUNDER_IDENTITIES.find((founder) => founder.slug === slug);
}

/** Scoped CSS custom-property override — never applied globally, only on the profile/card root. */
export function founderAccentStyle(accent: string): Record<string, string> {
  return {
    '--founder-accent': accent,
    '--founder-accent-subtle': hexToRgba(accent, 0.12),
  };
}

/**
 * Same value applied to the motif element on the About founder card and on
 * the Engineering Profile hero — the two elements a supported browser's
 * View Transitions API needs to treat as one continuous object across the
 * navigation. See useFounderMotifTransition (engineering/useFounderMotifTransition.ts).
 */
export function founderMotifViewTransitionStyle(slug: string): Record<string, string> {
  return { viewTransitionName: `founder-motif-${slug}` };
}

function hexToRgba(hex: string, alpha: number): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgb(${r} ${g} ${b} / ${alpha})`;
}
