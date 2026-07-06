import { Schema, type InferSchemaType, type Types } from "mongoose";

import { HOMEPAGE_RESOURCES } from "@/lib/cms/homepage-resources";
import { defineModel } from "@/models/shared/define-model";

/**
 * `ARCHITECTURE/11_DATABASE_ARCHITECTURE.md` §1's `SiteSettings` singleton,
 * extended with the fuller field set `ARCHITECTURE/19_CMS_FOUNDATION.md`
 * §11 calls for it to eventually carry (a genuine single-document
 * collection — no workflow, no `DataTable`, no list screen): company
 * contact details, social links, footer copy, SEO/OpenGraph defaults, and
 * analytics ids. Additive to `11`'s narrower
 * `{ foundingYear, currentStats, socials, footerContent }` sketch, not in
 * conflict with it — `foundingYear`/`currentStats` (a separate "real
 * numbers, not manually inflated" concern) aren't touched by this phase.
 *
 * `singletonKey` exists purely so `findOneAndUpdate` can target a unique
 * index instead of an empty `{}` filter: two concurrent first-saves with no
 * existing document could otherwise both observe "no match" against `{}`
 * and each insert their own document; a unique index makes the second
 * insert fail instead of silently duplicating the singleton.
 */
const siteSettingsSchema = new Schema(
  {
    singletonKey: { type: String, required: true, unique: true, default: "default" },
    companyName: { type: String, required: true, trim: true, maxlength: 160 },
    contactEmail: { type: String, trim: true, lowercase: true, maxlength: 200 },
    phone: { type: String, trim: true, maxlength: 40 },
    address: { type: String, trim: true, maxlength: 400 },
    socials: {
      linkedin: { type: String, trim: true },
      github: { type: String, trim: true },
      twitter: { type: String, trim: true },
      instagram: { type: String, trim: true },
    },
    footerText: { type: String, trim: true, maxlength: 500 },
    /**
     * @deprecated Superseded by `homepageItems` below — kept in the schema
     * (never `$unset` en masse) only so a document saved before this field
     * existed still reads back correctly; `getHomepageContent()`
     * (`lib/cms/public-content.ts`) falls back to these when `homepageItems`
     * is empty. `actions/studio/site-settings.ts` clears both the next time
     * this singleton is saved (a lazy, one-document "migration on next
     * write" — no script needed for a document there's only ever one of).
     */
    featuredCaseStudyId: { type: Schema.Types.ObjectId, ref: "CaseStudy" },
    /** @deprecated Superseded by `homepageItems` below — see that field's comment. */
    featuredCaseStudyIds: { type: [Schema.Types.ObjectId], ref: "CaseStudy", default: [] },
    /**
     * The homepage content configuration (`ARCHITECTURE/20_CONTENT_BLOCKS.md`
     * §6): an explicit, founder-editable, ordered, cross-collection list of
     * featured items — any of the five homepage-featurable collections
     * (`lib/cms/homepage-resources.ts`), not only Case Studies. Array order
     * is display order; `isHero` marks which single item (if any) gets the
     * homepage's large hero treatment (`getHomepageContent()`). No `ref` here
     * (each item can reference a different model, and this codebase resolves
     * references manually rather than via Mongoose `populate` everywhere
     * else too) — `id` is validated as a real ObjectId string by
     * `site-settings-fields.tsx`'s Zod schema, not by the Mongoose schema
     * itself. Optional/empty is fine: `getHomepageContent()` falls back to
     * the most recently published `featured: true` Case Study, then the most
     * recently published Case Study of any kind, so the homepage is never
     * left with nothing to show just because no one has configured this yet.
     */
    homepageItems: {
      type: [
        {
          _id: false,
          resource: { type: String, required: true, enum: HOMEPAGE_RESOURCES },
          id: { type: Schema.Types.ObjectId, required: true },
          visible: { type: Boolean, required: true, default: true },
          isHero: { type: Boolean, required: true, default: false },
        },
      ],
      default: [],
    },
    seo: {
      defaultTitle: { type: String, required: true, trim: true, maxlength: 160 },
      defaultDescription: { type: String, required: true, trim: true, maxlength: 300 },
      ogImage: { type: Schema.Types.ObjectId, ref: "Media" },
    },
    analytics: {
      googleAnalyticsId: { type: String, trim: true, maxlength: 40 },
      plausibleDomain: { type: String, trim: true, maxlength: 200 },
    },
  },
  { timestamps: true },
);

export type SiteSettingsDocument = InferSchemaType<typeof siteSettingsSchema> & {
  _id: Types.ObjectId;
};

export const SiteSettings = defineModel<SiteSettingsDocument>("SiteSettings", siteSettingsSchema);
