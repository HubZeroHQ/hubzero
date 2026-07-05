import {
  computeTeamMemberFields,
  teamMemberEmptyStateMessage,
  teamMemberFilters,
  teamMemberFormFields,
  teamMemberListColumns,
  teamMemberSchema,
  type TeamMemberInput,
} from "@/lib/cms/collections/team-member-fields";
import { defineCollection, registerCollection } from "@/lib/cms/collection-config";
import { TeamMember, type TeamMemberDocument } from "@/models/team-member";

export const teamMemberConfig = registerCollection(
  defineCollection<TeamMemberDocument, TeamMemberInput>({
    resource: "teamMember",
    label: "Team",
    model: TeamMember,
    zodSchema: teamMemberSchema,
    workflow: "draft-publish",
    listColumns: teamMemberListColumns,
    filters: teamMemberFilters,
    formFields: teamMemberFormFields,
    searchableFields: ["username", "name", "role"],
    emptyStateMessage: teamMemberEmptyStateMessage,
    studioBasePath: "team",
    recordLabel: (doc) => doc.name,
    computedFields: computeTeamMemberFields,
    // "Own content" for a profile means whose profile it is, not who created
    // the row (`ARCHITECTURE/19_CMS_FOUNDATION.md` §11) — see
    // `collection-config.ts`'s `ownerField` doc comment.
    ownerField: "linkedUserId",
    revalidatesPaths: (doc) => ["/team", `/team/${doc.username}`],
  }),
);
