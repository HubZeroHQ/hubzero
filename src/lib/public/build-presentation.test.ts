import { describe, expect, it } from 'vitest';
import { getPublicBuildStatePresentation } from './build-presentation';

describe('public Build state presentation', () => {
  it('uses one neutral historical treatment for retired Builds', () => {
    expect(getPublicBuildStatePresentation('retired')).toEqual({
      label: 'Retired',
      description: 'No longer actively maintained',
      tone: 'historical',
    });
  });

  it('fails closed for unknown presentation states', () => {
    expect(getPublicBuildStatePresentation('draft')).toBeNull();
  });
});
