import { workRepository } from '@/lib/db/repositories/work';
import { createContentAdapter } from './content-adapter';

export const workSearchAdapter = createContentAdapter({
  type: 'work',
  label: 'Work',
  href: (entry) => `/cms/content/work/${entry._id.toString()}`,
  list: () => workRepository.list(),
  getTitle: (entry) => entry.title,
  getReferenceId: (entry) => entry.referenceId,
});
