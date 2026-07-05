"use server";

import { connectToDatabase } from "@/lib/db";
import { leadSchema, type LeadFieldErrors, type SubmitLeadState } from "@/lib/lead-schema";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { Lead } from "@/models/lead";

/**
 * The Contact page's only mutation. Per
 * `ARCHITECTURE/08_TECHNICAL_ARCHITECTURE.md` §2, ordinary form submission
 * is a Server Action, not a Route Handler — there's no external
 * webhook/callback involved here, so a Route Handler would be the wrong
 * primitive.
 *
 * Spam protection: the honeypot field below catches naive scrapers at zero
 * infrastructure cost, and a per-IP rate limit backs it up against a bot
 * that skips the hidden field (a gap the security audit flagged — a
 * honeypot alone doesn't bound submission *volume*). `06_PAGE_SPECIFICATIONS.md`
 * "Contact" calls for "real captcha or equivalent" — that's a genuine,
 * disclosed gap against that spec, not an oversight; see the implementation
 * report for why it's deferred rather than silently dropped.
 */
export async function submitLead(
  _prevState: SubmitLeadState,
  formData: FormData,
): Promise<SubmitLeadState> {
  // Honeypot: real visitors never see or fill this field (hidden from the
  // visual layout and skipped by screen readers via the form markup). A bot
  // filling every field in a scraped form will fill this one too. Fail
  // silently — reporting success gives an automated submitter no signal to
  // adapt to.
  if (formData.get("website")) {
    return { status: "success" };
  }

  const ip = await getClientIp();
  const rateLimit = checkRateLimit(`contact:${ip}`, 5, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    return {
      status: "error",
      formError: "Too many submissions from this connection. Please try again in a few minutes.",
    };
  }

  const parsed = leadSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company"),
    projectType: formData.get("projectType"),
    budgetRange: formData.get("budgetRange"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const fieldErrors: LeadFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in fieldErrors)) {
        fieldErrors[key as keyof LeadFieldErrors] = issue.message;
      }
    }
    return { status: "error", fieldErrors };
  }

  try {
    await connectToDatabase();
    await Lead.create({
      ...parsed.data,
      sourcePage: "/contact",
    });
  } catch (error) {
    console.error("Failed to save lead submission:", error);
    return {
      status: "error",
      formError: "Something went wrong on our end. Please try again in a moment.",
    };
  }

  return { status: "success" };
}
