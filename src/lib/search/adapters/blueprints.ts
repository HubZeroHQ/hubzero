import { blueprintRepository } from '@/lib/db/repositories/blueprint';
import { createContentAdapter } from './content-adapter';

export const blueprintsSearchAdapter = createContentAdapter({
  type: 'blueprints',
  label: 'Blueprints',
  href: '/studio/content/blueprints',
  list: () => blueprintRepository.list(),
  getTitle: (entry) => entry.name,
  getReferenceId: (entry) => entry.referenceId,
});
