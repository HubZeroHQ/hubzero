"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/lib/cms/auth";
import { loginSchema, type LoginFieldErrors, type LoginState } from "@/lib/cms/login-schema";

/** Only ever redirect back into `/studio` — a bare `from` value from the URL is untrusted input. */
function safeRedirectTarget(from: FormDataEntryValue | null): string {
  if (typeof from === "string" && from.startsWith("/studio") && !from.startsWith("//")) {
    return from;
  }
  return "/studio";
}

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: LoginFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in fieldErrors)) {
        fieldErrors[key as keyof LoginFieldErrors] = issue.message;
      }
    }
    return { status: "error", fieldErrors };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: safeRedirectTarget(formData.get("from")),
    });
  } catch (error) {
    // Auth.js throws its own internal redirect (NEXT_REDIRECT) through this
    // same try block on success — only an actual `AuthError` is a failed
    // login; anything else must propagate so the redirect still happens.
    if (error instanceof AuthError) {
      return {
        status: "error",
        // Generic on purpose — never reveal which of email/password was
        // wrong (credential-enumeration hygiene, `19_CMS_FOUNDATION.md` §2).
        formError: "Incorrect email or password.",
      };
    }
    throw error;
  }

  return { status: "idle" };
}
