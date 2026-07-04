import { z } from "zod";

/**
 * Single source of truth for the contact form's shape — imported by the
 * client form (option labels), the Server Action (validation), and the
 * Mongoose model (enum values), so the field set and its constraints exist
 * in exactly one place. The field set itself is fixed by
 * `ARCHITECTURE/06_PAGE_SPECIFICATIONS.md` "Contact" — Name, Email, Company
 * (optional), Project type, Budget range (optional), Message — not
 * re-derived here.
 */

export const projectTypeOptions = [
  { value: "software", label: "Software Engineering" },
  { value: "hardware", label: "Hardware & Embedded" },
  { value: "both", label: "Both" },
] as const;

export const budgetRangeOptions = [
  { value: "under-5k", label: "Under $5,000" },
  { value: "5k-15k", label: "$5,000 – $15,000" },
  { value: "15k-50k", label: "$15,000 – $50,000" },
  { value: "50k-plus", label: "$50,000+" },
  { value: "not-sure", label: "Not sure yet" },
] as const;

type ProjectTypeValue = (typeof projectTypeOptions)[number]["value"];
type BudgetRangeValue = (typeof budgetRangeOptions)[number]["value"];

// Cast to a literal tuple, not a widened `[string, ...string[]]` — the
// latter satisfies `z.enum()`'s type signature too, but silently widens
// `LeadInput["projectType"]` to plain `string`, which let a since-tightened
// `Lead.create()` call (see `models/lead.ts`) go unchecked against the
// Mongoose schema's actual literal-union field type.
const projectTypeValues = projectTypeOptions.map((option) => option.value) as [
  ProjectTypeValue,
  ...ProjectTypeValue[],
];
const budgetRangeValues = budgetRangeOptions.map((option) => option.value) as [
  BudgetRangeValue,
  ...BudgetRangeValue[],
];

/** Converts a blank string (what an empty optional form field submits as) into `undefined`. */
function emptyToUndefined(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? undefined : value;
}

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120, "Keep it under 120 characters."),
  email: z
    .string()
    .trim()
    .max(200, "Keep it under 200 characters.")
    .pipe(z.email("Enter a valid email address.")),
  company: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(160, "Keep it under 160 characters.").optional(),
  ),
  projectType: z.enum(projectTypeValues, { error: "Choose the closest fit." }),
  budgetRange: z.preprocess(emptyToUndefined, z.enum(budgetRangeValues).optional()),
  message: z
    .string()
    .trim()
    .min(20, "A couple of sentences is enough to start.")
    .max(4000, "Keep it under 4,000 characters — we'll ask for more detail directly."),
});

export type LeadInput = z.infer<typeof leadSchema>;
export type LeadFieldErrors = Partial<Record<keyof LeadInput, string>>;

/**
 * `submitLead`'s state shape, kept out of `actions.ts` — a `"use server"`
 * file may only export async functions, not the plain object/type this
 * state needs alongside it (see `contact-form.tsx`, the only consumer).
 */
export interface SubmitLeadState {
  status: "idle" | "success" | "error";
  fieldErrors?: LeadFieldErrors;
  formError?: string;
}

export const initialSubmitLeadState: SubmitLeadState = { status: "idle" };
