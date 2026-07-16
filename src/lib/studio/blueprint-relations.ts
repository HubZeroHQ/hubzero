import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import { workRepository } from '@/lib/db/repositories/work';

/**
 * The option list behind Blueprint's one relation picker — technologies
 * (CMS_PRODUCT_DESIGN.md §4/§30's "relationships are pickers, not IDs").
 * Mirrors `build-relations.ts`/`work-relations.ts`'s shape; Blueprint has no
 * Lab/Work-style relation pickers of its own (Work/Build reference *into*
 * Blueprint via `relatedBlueprintIds`, not the other way — §24), so this
 * loader is intentionally the smallest of the three.
 */
export async function getBlueprintRelationOptions() {
  const technologies = await taxonomyRepository.findByKind('technology');

  return {
    technologyOptions: technologies.map((entry) => ({
      id: entry._id.toString(),
      label: entry.label,
    })),
  };
}

/**
 * The reverse side of Work's `relatedBlueprintIds` (§24) — "which Work
 * entries were generalized from this Blueprint" rendered automatically from
 * the same underlying reference, never a second field Blueprint itself has
 * to maintain (CMS_PRODUCT_DESIGN.md §4/§30). Build carries no equivalent
 * field today (§26.2's `relatedWorkIds` is Build's only cross-reference), so
 * there's only one direction to surface here.
 */
export async function getBlueprintReferencingWork(blueprintId: string) {
  const workEntries = await workRepository.list();
  return workEntries.filter((entry) =>
    entry.relatedBlueprintIds.some((id) => id.toString() === blueprintId),
  );
}
