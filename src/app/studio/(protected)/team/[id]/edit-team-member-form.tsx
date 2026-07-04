"use client";

import { autosaveDraft, update } from "@/actions/studio/team-members";
import { CmsEditForm } from "@/components/admin/form/cms-edit-form";
import {
  teamMemberFormFields,
  type TeamMemberInput,
} from "@/lib/cms/collections/team-member-fields";

export interface EditTeamMemberFormProps {
  id: string;
  initialValues: Partial<TeamMemberInput>;
  isDraft: boolean;
}

export function EditTeamMemberForm({ id, initialValues, isDraft }: EditTeamMemberFormProps) {
  return (
    <CmsEditForm<TeamMemberInput>
      fields={teamMemberFormFields}
      initialValues={initialValues}
      updateAction={update.bind(null, id)}
      autosaveAction={(values) => autosaveDraft(id, values)}
      isDraft={isDraft}
    />
  );
}
