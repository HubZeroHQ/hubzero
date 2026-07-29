/**
 * HubZero's currently supported relationship semantics. Blueprint Core owns
 * only the generic relationship contract; each product owns its vocabulary.
 */
export const HUBZERO_RELATIONSHIP_KINDS = [
  'contributed_to',
  'documents',
  'uses',
  'graduated_into',
  'applied_in',
  'related_to',
  'proven_by',
  'features',
] as const;

export type HubZeroRelationshipKind = (typeof HUBZERO_RELATIONSHIP_KINDS)[number];
