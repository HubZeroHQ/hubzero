import { blueprintRepository } from './blueprint';
import { buildRepository } from './build';
import { documentRepository } from './document';
import { engineeringProfileRepository } from './engineering-profile';
import { labRepository } from './lab';
import { leadRepository } from './lead';
import { mediaRepository } from './media';
import { noteRepository } from './note';
import { serviceRepository } from './service';
import { taxonomyRepository } from './taxonomy';
import { teamRepository } from './team';
import { userRepository } from './user';
import { workRepository } from './work';

export {
  blueprintRepository,
  buildRepository,
  documentRepository,
  engineeringProfileRepository,
  labRepository,
  leadRepository,
  mediaRepository,
  noteRepository,
  serviceRepository,
  taxonomyRepository,
  teamRepository,
  userRepository,
  workRepository,
};

/**
 * Mirrors `lib/db/collections.ts` — the single place every collection's
 * repository is spelled out.
 */
export const repositories = {
  work: workRepository,
  builds: buildRepository,
  blueprints: blueprintRepository,
  labs: labRepository,
  notes: noteRepository,
  engineeringProfiles: engineeringProfileRepository,
  team: teamRepository,
  services: serviceRepository,
  leads: leadRepository,
  users: userRepository,
  media: mediaRepository,
  taxonomy: taxonomyRepository,
  documents: documentRepository,
};
