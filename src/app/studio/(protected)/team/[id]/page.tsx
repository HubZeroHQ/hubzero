import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import {
  archive,
  cancelSchedule,
  getOne,
  publish,
  remove,
  restoreArchive,
  schedulePublish,
  scheduleUnpublish,
} from "@/actions/studio/team-members";
import { EditTeamMemberForm } from "@/app/studio/(protected)/team/[id]/edit-team-member-form";
import { PageHeader } from "@/components/admin/page-header";
import { WorkflowActions } from "@/components/admin/workflow-actions";
import { WorkflowStatusBadge } from "@/components/admin/workflow-status-badge";
import { Link, Text } from "@/components/ui";
import type { TeamMemberInput } from "@/lib/cms/collections/team-member-fields";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";

interface EditTeamMemberPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Team Member — HubZero Studio",
};

export default async function EditTeamMemberPage({ params }: EditTeamMemberPageProps) {
  const { id } = await params;

  const user = await requireSessionUser();
  if (!can(user, "view", "teamMember")) redirect("/studio");

  const doc = await getOne(id);
  if (!doc) notFound();

  // "Own content" for a profile is whose profile it is (`linkedUserId`), not
  // who created the row (`ARCHITECTURE/19_CMS_FOUNDATION.md` §11) — the same
  // distinction `collection-config.ts`'s `ownerField` encodes server-side,
  // mirrored here for the page-level render decision.
  //
  // `String(...)` and the `as` casts below: `ClientDocument<T>`
  // (`types/cms.ts`) only widens the fixed workflow fields
  // (`_id`/`createdBy`/date fields) from `ObjectId`/`Date` to `string` after
  // serialization — exactly as that type's own doc comment anticipates, this
  // is the first collection with its own reference field (`linkedUserId`)
  // and its own subdocument arrays (`skills`/`experience`/`education`),
  // which need the identical treatment locally rather than widening the
  // shared type for a shape only this collection has today.
  const target = { createdBy: String(doc.linkedUserId) };
  const canEdit = can(user, "edit", "teamMember", target);
  const canPublish = can(user, "publish", "teamMember", target);
  const canDelete = can(user, "delete", "teamMember", target);

  const initialValues: Partial<TeamMemberInput> = {
    username: doc.username,
    name: doc.name,
    role: doc.role,
    linkedUserId: String(doc.linkedUserId),
    bio: doc.bio,
    photo: doc.photo ? String(doc.photo) : undefined,
    skills: doc.skills as TeamMemberInput["skills"],
    socialsEmail: doc.socials?.email,
    socialsGithub: doc.socials?.github ?? undefined,
    socialsLinkedin: doc.socials?.linkedin ?? undefined,
    experience: doc.experience as TeamMemberInput["experience"],
    education: doc.education as TeamMemberInput["education"],
    isCoreMember: doc.isCoreMember,
    profileVisible: doc.profileVisible,
  };

  return (
    <>
      <PageHeader
        title={doc.name}
        description={doc.role}
        breadcrumb={[{ label: "Team", href: "/studio/team" }, { label: doc.name }]}
        actions={
          <div className="flex items-center gap-3">
            <Link href={`/studio/history/teamMember/${id}`}>View history →</Link>
            <WorkflowStatusBadge status={doc.status} />
          </div>
        }
      />

      <div className="mb-6">
        <WorkflowActions
          id={id}
          status={doc.status}
          workflow="draft-publish"
          canSubmitForReview={false}
          canPublish={canPublish}
          canDelete={canDelete}
          publish={publish}
          remove={remove}
          listHref="/studio/team"
          itemLabel="team member"
          scheduledPublishAt={doc.scheduledPublishAt}
          scheduledUnpublishAt={doc.scheduledUnpublishAt}
          schedulePublish={schedulePublish}
          scheduleUnpublish={scheduleUnpublish}
          cancelSchedule={cancelSchedule}
          archive={archive}
          restoreArchive={restoreArchive}
        />
      </div>

      {canEdit ? (
        <EditTeamMemberForm
          id={id}
          initialValues={initialValues}
          isDraft={doc.status === "draft"}
        />
      ) : (
        <Text tone="muted">You don&apos;t have permission to edit this team member.</Text>
      )}
    </>
  );
}
