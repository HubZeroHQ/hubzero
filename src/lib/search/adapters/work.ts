import { workRepository } from '@/lib/db/repositories/work';
import { createContentAdapter } from './content-adapter';

export const workSearchAdapter = createContentAdapter({
  type: 'work',
  label: 'Work',
  href: '/cms/content/work',
  list: () => workRepository.list(),
  getTitle: (entry) => entry.title,
  getReferenceId: (entry) => entry.referenceId,
});
