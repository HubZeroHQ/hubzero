import type { ReactNode } from "react";

import type { UserRole } from "@/models/user";

export type { UserRole };

/**
 * The shared type vocabulary the auth layer and the generic CRUD/permission
 * engine are written against — `ARCHITECTURE/19_CMS_FOUNDATION.md` §4.
 */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  dynamicPermissions: string[];
}

/**
 * The `can()` permission matrix's verbs (`ARCHITECTURE/19_CMS_FOUNDATION.md`
 * §3). `editOwn` is not a distinct grant a caller asks for — callers always
 * check `"edit"`; `editOwn` is the shape a role's grant list can contain,
 * which `can()` falls back to when the plain `"edit"` grant isn't present and
 * an ownership `target` was supplied.
 */
export type Action =
  "view" | "create" | "edit" | "editOwn" | "publish" | "approve" | "delete" | "manageUsers";

/**
 * Every resource the permission engine knows how to gate — one entry per
 * CMS collection (`ARCHITECTURE/09_CMS_ARCHITECTURE.md` §2) plus `user` for
 * account management. Adding a collection is a data change here and in
 * `permissions.ts`'s `roleGrants`, never a new code path.
 */
export type Resource =
  | "caseStudy"
  | "build"
  | "labsProject"
  | "blueprint"
  | "teamMember"
  | "testimonial"
  | "service"
  | "note"
  | "faq"
  | "careerListing"
  | "lead"
  | "siteSettings"
  | "media"
  | "user";

/**
 * The three workflow tiers a collection can declare
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §5). `"none"` is Lead's tier — system
 * generated, no draft/publish lifecycle at all.
 */
export type Workflow = "none" | "draft-publish" | "draft-review-publish";

export interface FieldOption {
  value: string;
  label: string;
}

interface BaseFieldConfig<TInput> {
  name: keyof TInput & string;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  /**
   * Optional panel grouping for `CmsForm` (`ARCHITECTURE/20_CONTENT_BLOCKS.md`
   * §9 — long forms like the five narrative collections' organized into
   * General/Media/People/Card/SEO/Content rather than one flat list). Purely
   * presentational and entirely opt-in: a collection that never sets this
   * (`Testimonial`, `TeamMember`, `Media`, …) renders exactly as before, one
   * flat list — `CmsForm` groups by whatever string each collection's own
   * `*-fields.tsx` supplies, so the layout stays generic (no collection
   * branches inside `CmsForm` itself) while each collection still controls
   * its own grouping.
   */
  group?: string;
}

/**
 * The fixed field-type vocabulary `ARCHITECTURE/19_CMS_FOUNDATION.md` §6
 * defines. Deliberately closed (a discriminated union, not an extensible
 * plugin registry) — per that section, a collection needing a genuinely new
 * field type is a signal to reconsider the content model first, not a
 * reason to widen this union.
 *
 * `"json"` is the one addition Phase D makes to this vocabulary (§14 Phase
 * E's collection rollout): `TeamMember.skills`/`socials`/`experience`/
 * `education` (`ARCHITECTURE/11_DATABASE_ARCHITECTURE.md` §1) are nested
 * arrays/objects with no flat-field equivalent, the same wall `CaseStudy`'s
 * `quote` hit and was deferred past rather than solved (`models/case-study.ts`).
 * Rather than build a full nested-repeater form builder for a shape only one
 * field family needs so far, this is a raw-JSON textarea, validated by the
 * collection's own Zod schema on submit — a deliberate, minimal escape
 * hatch, not a placeholder awaiting a future upgrade. A future collection
 * with the same "structured, variable-shape data" need reuses this instead
 * of prompting a fourth new field type.
 *
 * `"reference"`/`"referenceArray"` render a real searchable picker
 * (`<ReferencePicker>`/`<ReferencePickerList>`, `reference-picker.tsx`) — the
 * field only declares `resource` (which collection to search) and
 * `labelField` (which of that collection's own fields is the human-readable
 * label); `lib/cms/reference-search.ts` resolves both generically through
 * the `collection-config.ts` registry, so no collection-specific code exists
 * anywhere in the picker.
 */
/**
 * `"blocks"` (`ARCHITECTURE/20_CONTENT_BLOCKS.md`) is the one addition this
 * document's editorial-block evolution makes to the vocabulary — the
 * escape hatch for a narrative collection's long-form content, the same way
 * `"json"` was the sanctioned addition for `TeamMember`'s nested arrays.
 * Renders `<BlockEditor>` (`components/admin/blocks/block-editor.tsx`); the
 * value is a real `Block[]` (`lib/cms/blocks/types.ts`), never a markdown
 * string — a document's content is an ordered list of blocks the author
 * arranges freely, not a fixed set of named sections.
 */
export type FieldConfig<TInput = Record<string, unknown>> =
  | (BaseFieldConfig<TInput> & {
      type: "text" | "textarea" | "richtext" | "url" | "date" | "image" | "json";
    })
  | (BaseFieldConfig<TInput> & { type: "boolean" })
  | (BaseFieldConfig<TInput> & { type: "select"; options: FieldOption[] })
  | (BaseFieldConfig<TInput> & { type: "multiselect"; options?: FieldOption[] })
  | (BaseFieldConfig<TInput> & { type: "imageArray" })
  | (BaseFieldConfig<TInput> & { type: "reference"; resource: Resource; labelField: string })
  | (BaseFieldConfig<TInput> & { type: "referenceArray"; resource: Resource; labelField: string })
  | (BaseFieldConfig<TInput> & { type: "status" })
  | (BaseFieldConfig<TInput> & { type: "blocks" });

/** One column in a collection's `DataTable` — `ARCHITECTURE/19_CMS_FOUNDATION.md` §7. */
export interface TableColumn<T> {
  key: keyof T & string;
  label: string;
  sortable?: boolean;
  render?: (doc: T) => ReactNode;
}

/** One filter control in a collection's `DataTable` filter bar (§7). */
export type FilterConfig<T = Record<string, unknown>> =
  | { name: keyof T & string; label: string; type: "select"; options: FieldOption[] }
  | { name: keyof T & string; label: string; type: "text" }
  | { name: keyof T & string; label: string; type: "dateRange" };

/**
 * URL-search-param-driven table state (§7) — `use-cms-table.ts` reads/writes
 * these so a bookmarked list-view URL reproduces the exact same view.
 */
export interface TableSearchParams {
  sort?: string;
  dir?: "asc" | "desc";
  cursor?: string;
  q?: string;
  filters?: Record<string, string>;
}

/**
 * The shape a workflow document has after crossing the Server→Client
 * boundary (`serializeDocument`, `lib/cms/serialize.ts`). React Server
 * Components can only pass plain data to Client Components — `ObjectId` and
 * `Date` values get `JSON`-round-tripped into strings on the way, so `_id`,
 * `createdBy`, and the Mongoose-`timestamps`/`workflowFields` date fields are
 * strings here even though the storage-side document type (`T`) declares
 * them as `ObjectId`/`Date`. Narrow to exactly the fields the shared
 * `workflowFields()` mixin and `{ timestamps: true }` introduce, not a fully
 * generic deep-mapped type — a collection adding its own reference/date
 * field would need the same treatment, which no collection does yet.
 */
export type ClientDocument<T> = Omit<
  T,
  "_id" | "createdBy" | "publishedAt" | "createdAt" | "updatedAt"
> & {
  _id: string;
  createdBy?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

/** `crud-actions.ts`'s generic `list()` result — cursor-paginated, never a total count. */
export interface ListResult<T> {
  items: T[];
  nextCursor?: string;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * The shared result shape every generic CRUD Server Action returns — the
 * same `useActionState`-friendly convention `lead-schema.ts`'s
 * `SubmitLeadState` and `login-schema.ts`'s `LoginState` already establish,
 * generalized so `CmsForm` doesn't need to know which collection it's
 * rendering to know how to display a result.
 */
export interface CrudActionState<TInput = Record<string, unknown>> {
  status: "idle" | "success" | "error";
  fieldErrors?: Partial<Record<keyof TInput & string, string>>;
  formError?: string;
  id?: string;
}

/** Bulk delete/status-change result — `ARCHITECTURE/19_CMS_FOUNDATION.md` §7's bulk-action framework. */
export interface BulkActionResult {
  status: "success";
  succeeded: number;
  failed: number;
}
