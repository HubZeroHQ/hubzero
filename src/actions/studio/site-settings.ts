"use server";

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
    googleAnalyticsId,
    plausibleDomain,
    ...rest
  } = parsed.data;

  try {
    await SiteSettings.findOneAndUpdate(
      { singletonKey: "default" },
      {
        singletonKey: "default",
        ...rest,
        socials: {
          linkedin: socialsLinkedin,
          github: socialsGithub,
          twitter: socialsTwitter,
          instagram: socialsInstagram,
        },
        seo: {
          defaultTitle: seoDefaultTitle,
          defaultDescription: seoDefaultDescription,
          ogImage: ogImage ? new Types.ObjectId(ogImage) : undefined,
        },
        analytics: { googleAnalyticsId, plausibleDomain },
      },
      { upsert: true, new: true, runValidators: true },
    );
    // No `revalidatePath` call: no public page reads `SiteSettings` yet
    // (the same "nothing to revalidate" state every other collection
    // shipped in — `ARCHITECTURE/18_ARCHITECTURE_CHANGELOG.md`'s Phase D
    // entry) — wiring root metadata/footer/OG defaults to read from here is
    // real follow-up work, not done silently as a side effect of this form.
    return { status: "success" };
  } catch (error) {
    console.error("Failed to update site settings:", error);
    return {
      status: "error",
      formError: "Something went wrong while saving. Please try again.",
    };
  }
}
