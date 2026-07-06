import { Schema, type InferSchemaType, type Types } from "mongoose";

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
     * @deprecated Superseded by `featuredCaseStudyIds` below — kept in the
     * schema (never `$unset` en masse) only so a document saved before this
     * field existed still reads back correctly; `getFeaturedCaseStudy()`
     * falls back to it when `featuredCaseStudyIds` is empty.
     * `actions/studio/site-settings.ts` clears it the next time this
     * singleton is saved (a lazy, one-document "migration on next write" —
     * no script needed for a document there's only ever one of).
     */
    featuredCaseStudyId: { type: Schema.Types.ObjectId, ref: "CaseStudy" },
    /**
     * The homepage feature system (`ARCHITECTURE/20_CONTENT_BLOCKS.md` §6):
     * an explicit, founder-editable, ordered pick of which Case Studies the
     * homepage may show — an array so the data model doesn't have to change
     * again the day the homepage grows a second featured slot, even though
     * today's design (`getFeaturedCaseStudy()`) only ever reads the first
     * valid, published entry. Optional/empty is fine: the homepage falls
     * back to the most recently published `featured: true` Case Study, then
     * to the most recently published Case Study of any kind, so it's never
     * left with nothing to show just because no one has picked one yet.
     */
    featuredCaseStudyIds: { type: [Schema.Types.ObjectId], ref: "CaseStudy", default: [] },
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
