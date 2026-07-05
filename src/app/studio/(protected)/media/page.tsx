import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/admin/page-header";
import { MediaLibrary } from "@/components/admin/media/media-library";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";

export const metadata: Metadata = {
  title: "Media — HubZero Studio",
};

export default async function MediaLibraryPage() {
  const user = await requireSessionUser();
  if (!can(user, "view", "media")) redirect("/studio");

  return (
    <>
      <PageHeader
        title="Media"
        description="Every uploaded file — referenced by image fields across every collection."
      />
      <MediaLibrary canDelete={can(user, "delete", "media")} />
    </>
  );
}
