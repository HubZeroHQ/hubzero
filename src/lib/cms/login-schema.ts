import { z } from "zod";

/**
 * Single source of truth for the login form's shape, mirroring the
 * `lead-schema.ts` pattern — imported by the client form and the Server
 * Action. `LoginState`/`initialLoginState` live here rather than in
 * `actions.ts` for the same reason `SubmitLeadState` lives in
 * `lead-schema.ts`: a `"use server"` file may only export async functions.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email.")
    .pipe(z.email("Enter a valid email address.")),
  password: z.string().min(1, "Enter your password."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type LoginFieldErrors = Partial<Record<keyof LoginInput, string>>;

export interface LoginState {
  status: "idle" | "error";
  fieldErrors?: LoginFieldErrors;
  formError?: string;
}

export const initialLoginState: LoginState = { status: "idle" };
