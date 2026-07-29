import { blockSchema, type Block } from './blocks';

/**
 * Client-side mirror of the exact same `blockSchema` the repository layer
 * parses on write (`lib/db/repositories/document.ts`) — so the editor can
 * refuse to save (or silently skip an autosave tick) before a round trip
 * ever surfaces a `ZodError`, and can point the author at the specific
 * field, not just "one or more blocks are invalid." This is also the
 * mechanism behind CMS_PRODUCT_DESIGN.md §5's guardrails — an Image block
 * missing alt text, or a Metrics block missing its required `source`,
 * fails validation the same way a heading missing text does.
 */
export interface BlockValidationResult {
  valid: boolean;
  /** Dot-path (e.g. `data.altText`, `data.metrics.0.source`) → message. */
  fieldErrors: Record<string, string>;
}

export function validateBlock(block: Block): BlockValidationResult {
  const result = blockSchema.safeParse(block);
  if (result.success) {
    return { valid: true, fieldErrors: {} };
  }
  const fieldErrors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    if (!fieldErrors[path]) {
      fieldErrors[path] = issue.message;
    }
  }
  return { valid: false, fieldErrors };
}

export interface DocumentValidationResult {
  valid: boolean;
  invalidBlockIds: Set<string>;
}

export function validateDocument(blocks: Block[]): DocumentValidationResult {
  const invalidBlockIds = new Set<string>();
  for (const block of blocks) {
    if (!validateBlock(block).valid) {
      invalidBlockIds.add(block.id);
    }
  }
  return { valid: invalidBlockIds.size === 0, invalidBlockIds };
}
