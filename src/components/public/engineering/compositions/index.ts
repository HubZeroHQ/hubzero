import type { JSX } from 'react';
import type { FounderIdentity } from '@/config/founder-identity';
import type { ImmutablePublic } from '@/lib/public/domain';
import type { EngineeringProfile } from '../profile-shared';
import { IyadComposition } from './IyadComposition';
import { RaifComposition } from './RaifComposition';
import { RifaqueComposition } from './RifaqueComposition';
import { SalsabeelComposition } from './SalsabeelComposition';
import { SultanComposition } from './SultanComposition';

type Composition = (props: {
  profile: ImmutablePublic<EngineeringProfile>;
  identity: FounderIdentity;
}) => JSX.Element;

/** One bespoke composition per founder motif — see each file for what makes it structurally distinct. */
export const FOUNDER_COMPOSITIONS: Record<FounderIdentity['motif'], Composition> = {
  network: RifaqueComposition,
  dependencyGraph: RaifComposition,
  curve: IyadComposition,
  editorialGrid: SultanComposition,
  pcbTrace: SalsabeelComposition,
};
