"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/lib/cms/auth";
import { loginSchema, type LoginFieldErrors, type LoginState } from "@/lib/cms/login-schema";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/** Only ever redirect back into `/studio` — a bare `from` value from the URL is untrusted input. */
function safeRedirectTarget(from: FormDataEntryValue | null): string {
  if (typeof from === "string" && from.startsWith("/studio") && !from.startsWith("//")) {
    return from;
  }
  return "/studio";
}

const TOO_MANY_ATTEMPTS_MESSAGE =
  "Too many sign-in attempts. Please wait a few minutes and try again.";

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

  // Two independent buckets: one per IP (caps how many *different* emails one
  // origin can spray) and one per IP+email (caps repeated guesses against a
  // single account) — closes the brute-force gap the security audit flagged
  // without a heavier dependency (`ARCHITECTURE/19_CMS_FOUNDATION.md` §13).
  const ip = await getClientIp();
  const ipLimit = checkRateLimit(`login-ip:${ip}`, 20, 15 * 60 * 1000);
  const accountLimit = checkRateLimit(
    `login-account:${ip}:${parsed.data.email}`,
    5,
    15 * 60 * 1000,
  );
  if (!ipLimit.allowed || !accountLimit.allowed) {
    return { status: "error", formError: TOO_MANY_ATTEMPTS_MESSAGE };
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
