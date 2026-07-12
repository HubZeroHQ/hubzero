import { z } from "zod";

import { WorkflowStatusBadge } from "@/components/admin/workflow-status-badge";
import { objectIdField, optionalObjectIdField } from "@/lib/cms/collections/shared-validation";
import { jsonArray } from "@/lib/cms/json-field";
import { emptyToUndefined } from "@/lib/utils";
import type { TeamMemberDocument } from "@/models/team-member";
import type { ClientDocument, FieldConfig, FilterConfig, TableColumn } from "@/types/cms";

/**
 * TeamMember's Zod validation, form fields, and table/filter config — kept
 * Mongoose-import-free for the same reason `case-study-fields.tsx`
 * documents: Client Components in this module's import graph would break
 * the browser build the moment they pull in Mongoose transitively.
 */

export type TeamMemberRow = ClientDocument<TeamMemberDocument>;

const usernamePattern = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

const skillGroupSchema = z.object({
  category: z.string().trim().min(1, "Required.").max(80),
  items: z.array(z.string().trim().min(1).max(60)).default([]),
});

const experienceItemSchema = z.object({
  title: z.string().trim().min(1, "Required.").max(160),
  organization: z.string().trim().min(1, "Required.").max(160),
  startDate: z.string().trim().min(1, "Required.").max(40),
  endDate: z.string().trim().max(40).optional(),
  description: z.string().trim().max(2000).optional(),
});

const educationItemSchema = z.object({
  institution: z.string().trim().min(1, "Required.").max(160),
  degree: z.string().trim().min(1, "Required.").max(160),
  startDate: z.string().trim().min(1, "Required.").max(40),
  endDate: z.string().trim().max(40).optional(),
});

export const teamMemberSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "At least 2 characters.")
    .max(60, "Keep it under 60 characters.")
    .regex(usernamePattern, "Lowercase letters, numbers, and hyphens only."),
  name: z.string().trim().min(1, "Required.").max(120),
  role: z.string().trim().min(1, "Required.").max(120),
  bio: z.string().trim().min(1, "Required.").max(8000),
  photo: optionalObjectIdField("Choose a photo from the media library."),
  skills: jsonArray(skillGroupSchema),
  socialsGithub: z.preprocess(emptyToUndefined, z.url("Enter a valid URL.").optional()),
  socialsLinkedin: z.preprocess(emptyToUndefined, z.url("Enter a valid URL.").optional()),
  socialsEmail: z
    .string()
    .trim()
    .toLowerCase()
    .max(200)
    .pipe(z.email("Enter a valid email address.")),
  isCoreMember: z.boolean().default(false),
  profileVisible: z.boolean().default(false),
  experience: jsonArray(experienceItemSchema),
  education: jsonArray(educationItemSchema),
  linkedUserId: objectIdField("Select the linked user account."),
});

export type TeamMemberInput = z.infer<typeof teamMemberSchema>;

/**
 * `TeamMember.socials` is one nested object in the schema
 * (`ARCHITECTURE/11_DATABASE_ARCHITECTURE.md` §1) but three flat form
 * fields above — better authoring UX for a fixed, known sub-shape than a
 * raw JSON textarea. `config.computedFields` (the same sanctioned hook
 * Note's `readingTimeMinutes` uses) recombines them; the flat
 * `socialsGithub`/`socialsLinkedin`/`socialsEmail` keys are simply ignored
 * by Mongoose's strict-by-default schema once `socials` itself is set.
 */
export function computeTeamMemberFields(input: TeamMemberInput) {
  return {
    socials: {
      github: input.socialsGithub,
      linkedin: input.socialsLinkedin,
      email: input.socialsEmail,
    },
  };
}

export const teamMemberEmptyStateMessage =
  "No team members yet — add the first profile to get started.";

export const teamMemberFormFields: FieldConfig<TeamMemberInput>[] = [
  { name: "username", label: "Username", type: "text", required: true },
  { name: "name", label: "Name", type: "text", required: true },
  { name: "role", label: "Role", type: "text", required: true },
  {
    name: "linkedUserId",
    label: "Linked user account",
    type: "reference",
    resource: "user",
    labelField: "email",
    required: true,
  },
  { name: "bio", label: "Bio", type: "richtext", required: true },
  { name: "photo", label: "Photo", type: "image" },
  {
    name: "skills",
    label: "Skills",
    type: "json",
    description:
      'Array of { category, items[] }, e.g. [{"category":"Languages","items":["TypeScript"]}]',
  },
  { name: "socialsEmail", label: "Public email", type: "text", required: true },
  { name: "socialsGithub", label: "GitHub URL", type: "url" },
  { name: "socialsLinkedin", label: "LinkedIn URL", type: "url" },
  {
    name: "experience",
    label: "Experience",
    type: "json",
    description: "Array of { title, organization, startDate, endDate?, description? }",
  },
  {
    name: "education",
    label: "Education",
    type: "json",
    description: "Array of { institution, degree, startDate, endDate? }",
  },
  { name: "isCoreMember", label: "Core member", type: "boolean" },
  { name: "profileVisible", label: "Profile visible on /team", type: "boolean" },
];

export const teamMemberListColumns: TableColumn<TeamMemberRow>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "username", label: "Username" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status", render: (doc) => <WorkflowStatusBadge status={doc.status} /> },
  {
    key: "updatedAt",
    label: "Updated",
    sortable: true,
    render: (doc) => (doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString("en-US") : "—"),
  },
];

export const teamMemberFilters: FilterConfig<TeamMemberRow>[] = [
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "draft", label: "Draft" },
      { value: "published", label: "Published" },
    ],
  },
];
