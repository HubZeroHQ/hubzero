import { careerRepository } from '@/lib/db/repositories/career';
import { createContentAdapter } from './content-adapter';

/**
 * Careers joins search through the same factory as the four content pillars —
 * it is a `PublishableEntity` with the same title/slug/reference-ID shape, so
 * it needs no adapter logic of its own.
 */
export const careersSearchAdapter = createContentAdapter({
  type: 'careers',
  label: 'Careers',
  href: (entry) => `/studio/content/careers/${entry._id.toString()}`,
  list: () => careerRepository.list(),
  getTitle: (entry) => entry.title,
  getReferenceId: (entry) => entry.referenceId,
});
