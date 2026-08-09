import 'server-only';

import { cache } from 'react';
import { blueprintRepository } from '@/lib/db/repositories/blueprint';
import { buildRepository } from '@/lib/db/repositories/build';
import { careerRepository } from '@/lib/db/repositories/career';
import { engineeringProfileRepository } from '@/lib/db/repositories/engineering-profile';
import { labRepository } from '@/lib/db/repositories/lab';
import { noteRepository } from '@/lib/db/repositories/note';
import { serviceRepository } from '@/lib/db/repositories/service';
import { teamRepository } from '@/lib/db/repositories/team';
import { workRepository } from '@/lib/db/repositories/work';

export interface StudioContentSnapshot {
  work: Awaited<ReturnType<typeof workRepository.list>>;
  builds: Awaited<ReturnType<typeof buildRepository.list>>;
  blueprints: Awaited<ReturnType<typeof blueprintRepository.list>>;
  labs: Awaited<ReturnType<typeof labRepository.list>>;
  notes: Awaited<ReturnType<typeof noteRepository.list>>;
  careers: Awaited<ReturnType<typeof careerRepository.list>>;
  services: Awaited<ReturnType<typeof serviceRepository.list>>;
  team: Awaited<ReturnType<typeof teamRepository.list>>;
  profiles: Awaited<ReturnType<typeof engineeringProfileRepository.list>>;
}

/**
 * One request-scoped Studio content snapshot.
 *
 * React owns the memoization lifetime, so records cannot leak between users or
 * requests. This is neither a persistent cache nor a MongoDB pool: it only
 * coalesces identical broad collection reads performed by sibling Server
 * Components (dashboard content, health, and relationship integrity) during
 * one render.
 */
export const loadStudioContentSnapshot = cache(async (): Promise<StudioContentSnapshot> => {
  const [work, builds, blueprints, labs, notes, careers, services, team, profiles] =
    await Promise.all([
      workRepository.list(),
      buildRepository.list(),
      blueprintRepository.list(),
      labRepository.list(),
      noteRepository.list(),
      careerRepository.list(),
      serviceRepository.list(),
      teamRepository.list(),
      engineeringProfileRepository.list(),
    ]);

  return { work, builds, blueprints, labs, notes, careers, services, team, profiles };
});
