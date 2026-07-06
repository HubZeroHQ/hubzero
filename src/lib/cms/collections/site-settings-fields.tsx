import { z } from "zod";

import { objectIdField, optionalObjectIdField } from "@/lib/cms/collections/shared-validation";
import { emptyToUndefined } from "@/lib/utils";
import type { FieldConfig } from "@/types/cms";

/**
 * Settings' Zod validation + form fields — kept Mongoose-import-free for the
 * same reason every other collection's `*-fields.tsx` is
 * (`case-study-fields.tsx`'s header comment). Flat, `CmsForm`-shaped fields
 * that `actions/studio/site-settings.ts` recombines into `SiteSettings`'
 * nested `socials`/`seo`/`analytics` sub-objects on save — the same
 * flatten-for-authoring/nest-for-storage pattern `TeamMember.socials`
 * already established (`team-member-fields.tsx`'s `computeTeamMemberFields`).
 */

export const siteSettingsSchema = z.object({
  companyName: z.string().trim().min(1, "Required.").max(160),
  contactEmail: z.preprocess(emptyToUndefined, z.email("Enter a valid email address.").optional()),
  phone: z.preprocess(emptyToUndefined, z.string().trim().max(40).optional()),
  address: z.preprocess(emptyToUndefined, z.string().trim().max(400).optional()),
  socialsLinkedin: z.preprocess(emptyToUndefined, z.url("Enter a valid URL.").optional()),
  socialsGithub: z.preprocess(emptyToUndefined, z.url("Enter a valid URL.").optional()),
  socialsTwitter: z.preprocess(emptyToUndefined, z.url("Enter a valid URL.").optional()),
  socialsInstagram: z.preprocess(emptyToUndefined, z.url("Enter a valid URL.").optional()),
  footerText: z.preprocess(emptyToUndefined, z.string().trim().max(500).optional()),
  featuredCaseStudyIds: z.array(objectIdField()).max(5).default([]),
  seoDefaultTitle: z.string().trim().min(1, "Required.").max(160),
  seoDefaultDescription: z.string().trim().min(1, "Required.").max(300),
  ogImage: optionalObjectIdField("Choose a default OpenGraph image from the media library."),
  googleAnalyticsId: z.preprocess(emptyToUndefined, z.string().trim().max(40).optional()),
  plausibleDomain: z.preprocess(emptyToUndefined, z.string().trim().max(200).optional()),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

export const siteSettingsFormFields: FieldConfig<SiteSettingsInput>[] = [
  { name: "companyName", label: "Company name", type: "text", required: true },
  { name: "contactEmail", label: "Contact email", type: "text" },
  { name: "phone", label: "Phone", type: "text" },
  { name: "address", label: "Address", type: "textarea" },
  { name: "socialsLinkedin", label: "LinkedIn URL", type: "url" },
  { name: "socialsGithub", label: "GitHub URL", type: "url" },
  { name: "socialsTwitter", label: "Twitter / X URL", type: "url" },
  { name: "socialsInstagram", label: "Instagram URL", type: "url" },
  {
    name: "footerText",
    label: "Footer text",
    type: "textarea",
    description: "Short blurb shown in the site footer.",
  },
  {
    name: "featuredCaseStudyIds",
    label: "Featured case studies",
    type: "referenceArray",
    resource: "caseStudy",
    labelField: "client",
    description:
      "The homepage shows the first one here. Leave empty to feature the most recently published one automatically.",
  },
  { name: "seoDefaultTitle", label: "Default SEO title", type: "text", required: true },
  {
    name: "seoDefaultDescription",
    label: "Default SEO description",
    type: "textarea",
    required: true,
  },
  { name: "ogImage", label: "Default OpenGraph image", type: "image" },
  {
    name: "googleAnalyticsId",
    label: "Google Analytics ID",
    type: "text",
    description: "e.g. G-XXXXXXX. Leave blank to disable.",
  },
  {
    name: "plausibleDomain",
    label: "Plausible domain",
    type: "text",
    description: "e.g. hubzero.dev. Leave blank to disable.",
  },
];
