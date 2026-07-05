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

export type SiteSettingsDocument = InferSchemaType<typeof siteSettingsSchema> & { _id: Types.ObjectId };

export const SiteSettings = defineModel<SiteSettingsDocument>("SiteSettings", siteSettingsSchema);
