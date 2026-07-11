import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSiteSettings, updateSiteSettings } from "@/actions/studio/site-settings";
import { CmsForm } from "@/components/admin/form/cms-form";
import { PageHeader } from "@/components/admin/page-header";
import { Text } from "@/components/ui";
import { siteConfig } from "@/config/site";
import { siteSettingsFormFields } from "@/lib/cms/collections/site-settings-fields";
import type { SiteSettingsInput } from "@/lib/cms/collections/site-settings-fields";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";

export const metadata: Metadata = {
  title: "Settings — HubZero Studio",
};

/**
 * `ARCHITECTURE/19_CMS_FOUNDATION.md` §11's deliberate exception: a single
 * `<CmsForm>` bound directly to the one `SiteSettings` document — no
 * `DataTable`, no workflow controls, no create/delete. Head-Admin-only,
 * per `permissions.ts`'s existing `siteSettings` grants (only `head_admin`'s
 * wildcard holds any).
 */
export default async function SiteSettingsPage() {
  const user = await requireSessionUser();
  if (!can(user, "view", "siteSettings")) redirect("/studio");
  const canEdit = can(user, "edit", "siteSettings");

  const doc = await getSiteSettings();

  const initialValues: Partial<SiteSettingsInput> = doc
    ? {
        companyName: doc.companyName,
        contactEmail: doc.contactEmail ?? undefined,
        phone: doc.phone ?? undefined,
        address: doc.address ?? undefined,
        socialsLinkedin: doc.socials?.linkedin ?? undefined,
        socialsGithub: doc.socials?.github ?? undefined,
        socialsTwitter: doc.socials?.twitter ?? undefined,
        socialsInstagram: doc.socials?.instagram ?? undefined,
        footerText: doc.footerText ?? undefined,
        // `serializeDocument` (`getSiteSettings`) already turned every
        // nested `ObjectId` into a plain string at runtime — `ClientDocument`
        // doesn't recurse its type-level remapping into a subdocument array,
        // though, so `item.id` still types as `Types.ObjectId` here; `String()`
        // aligns the type with `HomepageItem.id: string` without doing any
        // real runtime conversion.
        homepageItems: (doc.homepageItems ?? []).map((item) => ({
          ...item,
          id: String(item.id),
        })),
        seoDefaultTitle: doc.seo?.defaultTitle ?? siteConfig.title,
        seoDefaultDescription: doc.seo?.defaultDescription ?? siteConfig.description,
        ogImage: doc.seo?.ogImage ? String(doc.seo.ogImage) : undefined,
        googleAnalyticsId: doc.analytics?.googleAnalyticsId ?? undefined,
        plausibleDomain: doc.analytics?.plausibleDomain ?? undefined,
        privacyContent: doc.privacyContent ?? [],
        termsContent: doc.termsContent ?? [],
      }
    : {
        // No document has been saved yet — pre-fill from the facts already
        // approved in `config/site.ts` rather than leaving the form blank,
        // never a fabricated placeholder.
        companyName: siteConfig.name,
        seoDefaultTitle: siteConfig.title,
        seoDefaultDescription: siteConfig.description,
        privacyContent: [],
        termsContent: [],
      };

  return (
    <>
      <PageHeader
        title="Settings"
        description="Sitewide company details, SEO defaults, and analytics — a single shared document, not a list."
      />
      {canEdit ? (
        <CmsForm
          fields={siteSettingsFormFields}
          initialValues={initialValues}
          action={updateSiteSettings}
          submitLabel="Save settings"
        />
      ) : (
        <Text tone="muted">You don&apos;t have permission to edit site settings.</Text>
      )}
    </>
  );
}
