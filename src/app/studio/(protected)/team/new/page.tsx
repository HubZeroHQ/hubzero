import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { NewTeamMemberForm } from "@/app/studio/(protected)/team/new/new-team-member-form";
import { PageHeader } from "@/components/admin/page-header";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";

export const metadata: Metadata = {
  title: "New Team Member — HubZero Studio",
};

export default async function NewTeamMemberPage() {
  const user = await requireSessionUser();
  if (!can(user, "create", "teamMember")) redirect("/studio/team");

  return (
    <>
      <PageHeader
        title="New team member"
        breadcrumb={[{ label: "Team", href: "/studio/team" }, { label: "New" }]}
      />
      <NewTeamMemberForm />
    </>
  );
}
