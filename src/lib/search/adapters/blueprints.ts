import { blueprintRepository } from '@/lib/db/repositories/blueprint';
import { createContentAdapter } from './content-adapter';

export const blueprintsSearchAdapter = createContentAdapter({
  type: 'blueprints',
  label: 'Blueprints',
  href: (entry) => `/studio/content/blueprints/${entry._id.toString()}`,
  list: () => blueprintRepository.list(),
  getTitle: (entry) => entry.name,
  getReferenceId: (entry) => entry.referenceId,
});
