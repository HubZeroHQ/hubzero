/**
 * Makes a Mongoose `.lean()` result safe to pass from a Server Component to
 * a Client Component (`DataTable`, `CmsForm`). React Server Components only
 * serialize plain data across that boundary — a raw lean result's `ObjectId`
 * fields (`_id`, `createdBy`, any reference) are class instances, which
 * fail that serialization even though they carry a `toJSON()`. Round-tripping
 * through `JSON` runs every `toJSON()` (ObjectId → string, Date → ISO
 * string) and yields a plain object, at the honest cost that `Date` fields
 * are strings afterward, not `Date` instances — call sites that render a
 * date should pass it through `new Date(value)` rather than assume the
 * server-side type still holds after this call.
 */
export function serializeDocument<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}
