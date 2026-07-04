"use client";

import { create } from "@/actions/studio/team-members";
import { CmsCreateForm } from "@/components/admin/form/cms-create-form";
import {
  teamMemberFormFields,
  type TeamMemberInput,
} from "@/lib/cms/collections/team-member-fields";

export function NewTeamMemberForm() {
  return (
    <CmsCreateForm<TeamMemberInput>
      fields={teamMemberFormFields}
      action={create}
      redirectTo={(id) => `/studio/team/${id}`}
    />
  );
}
