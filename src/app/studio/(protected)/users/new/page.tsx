import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { UserCreateForm } from "@/app/studio/(protected)/users/new/user-create-form";
import { PageHeader } from "@/components/admin/page-header";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";

export const metadata: Metadata = {
  title: "New User — HubZero Studio",
};

export default async function NewUserPage() {
  const user = await requireSessionUser();
  if (!can(user, "manageUsers", "user")) redirect("/studio/users");

  return (
    <>
      <PageHeader
        title="New user"
        breadcrumb={[{ label: "Users", href: "/studio/users" }, { label: "New" }]}
      />
      <UserCreateForm />
    </>
  );
}
