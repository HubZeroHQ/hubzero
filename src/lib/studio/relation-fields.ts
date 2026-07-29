interface OwnerFieldMapping<TOwner extends string> {
  key: TOwner;
  field: string;
}

/**
 * Reads a polymorphic set of relation-picker fields (one `RelationMultiSelect`
 * per owner type) off `FormData` into a flat array of `{ownerType, ownerId}`
 * references — the inverse of `splitEntriesByOwnerType`. Shared by
 * Note/Career/Service, which each need this exact generic read, previously
 * re-implemented three times as `readRelatedEntries`/`readCareerRelatedEntries`/
 * `readEvidenceLinks`.
 */
export function readEntriesFromFormData<TOwner extends string>(
  formData: FormData,
  fields: readonly OwnerFieldMapping<TOwner>[],
): { ownerType: TOwner; ownerId: string }[] {
  return fields.flatMap(({ key, field }) =>
    formData.getAll(field).map((id) => ({ ownerType: key, ownerId: String(id) })),
  );
}

/**
 * Splits that same polymorphic reference array back into the per-owner-type
 * id arrays each form's pickers expect — the inverse of
 * `readEntriesFromFormData`. Shared by Note/Career/Service, previously
 * re-implemented three times as `splitRelatedEntries`/
 * `splitCareerRelatedEntries`/`splitServiceEvidenceLinks`. Callers cast the
 * result to their own named-field shape (the field names come from `fields`
 * at runtime, but aren't literal types here).
 */
export function splitEntriesByOwnerType<
  TOwner extends string,
  TEntry extends { ownerType: TOwner; ownerId: { toString(): string } },
>(
  entries: readonly TEntry[],
  fields: readonly OwnerFieldMapping<TOwner>[],
): Record<string, string[]> {
  const result: Record<string, string[]> = Object.fromEntries(
    fields.map(({ field }) => [field, []]),
  );
  for (const { key, field } of fields) {
    result[field] = entries
      .filter((entry) => entry.ownerType === key)
      .map((entry) => entry.ownerId.toString());
  }
  return result;
}
