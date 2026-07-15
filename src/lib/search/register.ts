import { registerSearchAdapter } from './registry';
import { blueprintsSearchAdapter } from './adapters/blueprints';
import { buildsSearchAdapter } from './adapters/builds';
import { labsSearchAdapter } from './adapters/labs';
import { leadsSearchAdapter } from './adapters/leads';
import { mediaSearchAdapter } from './adapters/media';
import { notesSearchAdapter } from './adapters/notes';
import { servicesSearchAdapter } from './adapters/services';
import { teamSearchAdapter } from './adapters/team';
import { usersSearchAdapter } from './adapters/users';
import { workSearchAdapter } from './adapters/work';

/**
 * The single place every collection's search adapter is registered. A
 * future collection (or Media/Taxonomy/Document full-text search, §7)
 * joins the index by adding one adapter file and one line here — never by
 * modifying `registry.ts`'s aggregation logic.
 *
 * Side-effect module: importing it registers every adapter. Imported once,
 * from the search route handler.
 */
let registered = false;

export function ensureSearchAdaptersRegistered(): void {
  if (registered) {
    return;
  }
  registered = true;

  registerSearchAdapter(workSearchAdapter);
  registerSearchAdapter(buildsSearchAdapter);
  registerSearchAdapter(blueprintsSearchAdapter);
  registerSearchAdapter(labsSearchAdapter);
  registerSearchAdapter(notesSearchAdapter);
  registerSearchAdapter(teamSearchAdapter);
  registerSearchAdapter(servicesSearchAdapter);
  registerSearchAdapter(leadsSearchAdapter);
  registerSearchAdapter(usersSearchAdapter);
  registerSearchAdapter(mediaSearchAdapter);
}
