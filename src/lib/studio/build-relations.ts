import { labRepository } from '@/lib/db/repositories/lab';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import { workRepository } from '@/lib/db/repositories/work';

/**
 * The option lists behind Build's relation pickers (technologies,
 * originating Lab, related Work) — CMS_PRODUCT_DESIGN.md §4/§30's
 * "relationships are pickers, not IDs." Mirrors `work-relations.ts`'s
 * shape exactly; the only real difference between the two collections'
 * relation option-loaders is which repositories they query.
 */
export async function getBuildRelationOptions() {
  const [technologies, labs, workEntries] = await Promise.all([
    taxonomyRepository.findByKind('technology'),
    labRepository.list(),
    workRepository.list(),
  ]);

  return {
    technologyOptions: technologies.map((entry) => ({
      id: entry._id.toString(),
      label: entry.label,
    })),
    labOptions: labs.map((entry) => ({
      id: entry._id.toString(),
      label: entry.title,
      referenceId: entry.referenceId,
    })),
    workOptions: workEntries.map((entry) => ({
      id: entry._id.toString(),
      label: entry.title,
      referenceId: entry.referenceId,
    })),
  };
}
