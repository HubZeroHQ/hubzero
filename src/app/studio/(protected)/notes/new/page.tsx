import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { NewNoteForm } from "@/app/studio/(protected)/notes/new/new-note-form";
import { PageHeader } from "@/components/admin/page-header";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";

export const metadata: Metadata = {
  title: "New Note — HubZero Studio",
};

export default async function NewNotePage() {
  const user = await requireSessionUser();
  if (!can(user, "create", "note")) redirect("/studio/notes");

  return (
    <>
      <PageHeader
        title="New note"
        breadcrumb={[{ label: "Notes", href: "/studio/notes" }, { label: "New" }]}
      />
      <NewNoteForm />
    </>
  );
}
