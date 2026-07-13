import { buildRepository } from '@/lib/db/repositories/build';
import { createContentAdapter } from './content-adapter';

export const buildsSearchAdapter = createContentAdapter({
  type: 'builds',
  label: 'Builds',
  href: '/cms/content/builds',
  list: () => buildRepository.list(),
  getTitle: (entry) => entry.title,
  getReferenceId: (entry) => entry.referenceId,
});
