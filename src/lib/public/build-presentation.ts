import type { PublicBuildSummary } from './domain';

export type PublicBuildState = PublicBuildSummary['deploymentState'];

interface PublicBuildStatePresentation {
  readonly label: 'Live' | 'Retired';
  readonly description: string;
  readonly tone: 'active' | 'historical';
}

const BUILD_STATE_PRESENTATION: Readonly<Record<PublicBuildState, PublicBuildStatePresentation>> = {
  live: {
    label: 'Live',
    description: 'Actively maintained',
    tone: 'active',
  },
  retired: {
    label: 'Retired',
    description: 'No longer actively maintained',
    tone: 'historical',
  },
};

/** Shared editorial language for Build maintenance state across every public surface. */
export function getPublicBuildStatePresentation(
  state: unknown,
): PublicBuildStatePresentation | null {
  return state === 'live' || state === 'retired' ? BUILD_STATE_PRESENTATION[state] : null;
}
