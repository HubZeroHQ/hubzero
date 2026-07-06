"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import type { ZodError } from "zod";

import {
  siteSettingsFormFields,
  siteSettingsSchema,
  type SiteSettingsInput,
} from "@/lib/cms/collections/site-settings-fields";
import { requirePermission } from "@/lib/cms/permissions";
import { serializeDocument } from "@/lib/cms/serialize";
import { connectToDatabase } from "@/lib/db";
import { SiteSettings, type SiteSettingsDocument } from "@/models/site-settings";
import type { ClientDocument, CrudActionState } from "@/types/cms";

/**
 * `SiteSettings`' own Server Actions — deliberately not `createCrudActions()`
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §11's explicit exception): there is no
 * list, no workflow, no `create`/`delete`, just a `findOneAndUpdate` upsert
 * against the one document. Reuses the generic engine everywhere it still
 * applies — the Zod schema shape, the `CrudActionState` result contract, and
 * `<CmsForm>` itself — so the *screen* is generic even though the *actions*
 * are a deliberate, small, one-off pair, exactly as `19` recommends.
 */

function flattenZodErrors(
  error: ZodError,
): Partial<Record<keyof SiteSettingsInput & string, string>> {
  const fieldErrors: Partial<Record<keyof SiteSettingsInput & string, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in fieldErrors)) {
      fieldErrors[key as keyof SiteSettingsInput & string] = issue.message;
    }
  }
  return fieldErrors;
}

export type ClientSiteSettings = ClientDocument<SiteSettingsDocument>;

export async function getSiteSettings(): Promise<ClientSiteSettings | null> {
  await requirePermission("view", "siteSettings");
  await connectToDatabase();
  const doc = await SiteSettings.findOne({ singletonKey: "default" }).lean<SiteSettingsDocument>();
  return doc ? (serializeDocument(doc) as unknown as ClientSiteSettings) : null;
}

export async function updateSiteSettings(
  _prevState: CrudActionState<SiteSettingsInput>,
  formData: FormData,
): Promise<CrudActionState<SiteSettingsInput>> {
  await requirePermission("edit", "siteSettings");
  await connectToDatabase();

  const raw: Record<string, unknown> = {};
  for (const field of siteSettingsFormFields) {
    const value = formData.get(field.name);
    raw[field.name] = typeof value === "string" ? value : undefined;
  }

  const parsed = siteSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", fieldErrors: flattenZodErrors(parsed.error) };
  }

  const {
    socialsLinkedin,
    socialsGithub,
    socialsTwitter,
    socialsInstagram,
    seoDefaultTitle,
    seoDefaultDescription,
    ogImage,
    featuredCaseStudyId,
    googleAnalyticsId,
    plausibleDomain,
    ...rest
  } = parsed.data;

  // A plain-object `findOneAndUpdate` silently drops any key whose value is
  // `undefined` before it reaches MongoDB — it does *not* unset a
  // previously-stored value. `featuredCaseStudyId` is a top-level optional
  // reference an editor can legitimately clear back to "unset," so clearing
  // it needs an explicit `$unset`, not a `$set` to `undefined` (which would
  // silently leave the old reference in place). `ogImage` doesn't need the
  // same treatment: it lives inside `seo`, and `$set`ting the whole `seo`
  // object below already replaces it wholesale — omitting `ogImage` from
  // that object already clears it, and `$unset`ting a child of a path this
  // same update also `$set`s (`seo.ogImage` under `seo`) is a MongoDB
  // conflict error, not a no-op.
  const unset: Record<string, ""> = {};
  if (!featuredCaseStudyId) unset.featuredCaseStudyId = "";

  try {
    await SiteSettings.findOneAndUpdate(
      { singletonKey: "default" },
      {
        $set: {
          singletonKey: "default",
          ...rest,
          ...(featuredCaseStudyId
            ? { featuredCaseStudyId: new Types.ObjectId(featuredCaseStudyId) }
            : {}),
          socials: {
            linkedin: socialsLinkedin,
            github: socialsGithub,
            twitter: socialsTwitter,
            instagram: socialsInstagram,
          },
          seo: {
            defaultTitle: seoDefaultTitle,
            defaultDescription: seoDefaultDescription,
            ...(ogImage ? { ogImage: new Types.ObjectId(ogImage) } : {}),
          },
          analytics: { googleAnalyticsId, plausibleDomain },
        },
        ...(Object.keys(unset).length > 0 ? { $unset: unset } : {}),
      },
      { upsert: true, new: true, runValidators: true },
    );
    // The homepage feature system (`ARCHITECTURE/20_CONTENT_BLOCKS.md` §6)
    // is the first public page reading `SiteSettings` — `featuredCaseStudyId`
    // changing is the one field on this form the homepage's own ISR cache
    // needs to hear about immediately, so this is a narrow, deliberate
    // exception to this action's previous "nothing to revalidate" state, not
    // a general revalidation of every settings field.
    revalidatePath("/");
    return { status: "success" };
  } catch (error) {
    console.error("Failed to update site settings:", error);
    return {
      status: "error",
      formError: "Something went wrong while saving. Please try again.",
    };
  }
}
