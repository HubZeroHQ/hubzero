import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getOne, remove } from "@/actions/studio/users";
import { UserDeleteButton } from "@/app/studio/(protected)/users/[id]/user-delete-button";
import { UserEditForm } from "@/app/studio/(protected)/users/[id]/user-edit-form";
import { UserResetPasswordButton } from "@/app/studio/(protected)/users/[id]/user-reset-password-button";
import { Card, Heading } from "@/components/ui";
import { PageHeader } from "@/components/admin/page-header";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";

export const metadata: Metadata = {
  title: "Edit User — HubZero Studio",
};

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params;

  const sessionUser = await requireSessionUser();
  if (!can(sessionUser, "manageUsers", "user")) redirect("/studio");

  const doc = await getOne(id);
  if (!doc) notFound();

  const isSelf = doc._id === sessionUser.id;

  return (
    <>
      <PageHeader
        title={doc.name}
        description={doc.email}
        breadcrumb={[{ label: "Users", href: "/studio/users" }, { label: doc.name }]}
      />

      <div className="flex flex-col gap-6">
        <UserEditForm
          key={doc.updatedAt}
          id={id}
          initialValues={{
            email: doc.email,
            name: doc.name,
            role: doc.role,
            disabled: doc.disabled,
          }}
          isSelf={isSelf}
        />

        <Card>
          <Heading level={3} className="mb-4">
            Security
          </Heading>
          <UserResetPasswordButton id={id} isSelf={isSelf} />
        </Card>

        <Card>
          <Heading level={3} className="mb-4">
            Danger zone
          </Heading>
          <UserDeleteButton id={id} isSelf={isSelf} remove={remove} />
        </Card>
      </div>
    </>
  );
}
