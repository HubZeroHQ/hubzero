"use client";

import { useActionState, useState } from "react";

import { submitLead } from "@/app/(marketing)/contact/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { budgetRangeOptions, initialSubmitLeadState, projectTypeOptions } from "@/lib/lead-schema";

/**
 * The one interactive piece of the Contact page. `useActionState` swaps to
 * the success message in place, without a route change — the "success
 * state" the brief calls for is a render branch of this component, not a
 * `/thanks` redirect.
 *
 * Every field is controlled from local state rather than left as plain
 * uncontrolled inputs: React resets a `<form action={fn}>`'s fields after
 * *every* action call, including a failed one (the same reset a native
 * form submission would do on navigation). Left uncontrolled, a visitor who
 * mistypes one field — say, leaves budget range at its default — would
 * watch their whole message disappear along with it. That's the opposite
 * of "respectful" validation, so this trades a few lines of state plumbing
 * to keep what someone already typed on screen through a failed submit.
 */
export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitLead, initialSubmitLeadState);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [projectType, setProjectType] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [message, setMessage] = useState("");

  if (state.status === "success") {
    return (
      <div className="max-w-md">
        <p className="text-h2 text-text font-normal">Thanks — that&apos;s on its way to us.</p>
        <p className="text-body text-text-muted mt-4">
          Not a ticket queue — we read every message ourselves and typically reply within two
          business days. This is just the start of a conversation; nothing about it commits you to
          anything yet.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Honeypot — invisible and unreachable for a real visitor (off-screen,
          aria-hidden, excluded from tab order), filled in only by scripts
          that fill every field in a scraped form. See actions.ts for the
          scope note on why this, and not a real captcha, is this session's
          spam-protection bar. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input
          name="name"
          label="Name"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={state.fieldErrors?.name}
        />
        <Input
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={state.fieldErrors?.email}
        />
      </div>

      <Input
        name="company"
        label="Company"
        hint="Optional."
        autoComplete="organization"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        error={state.fieldErrors?.company}
      />

      <RadioGroup
        name="projectType"
        label="Project type"
        required
        value={projectType}
        onValueChange={setProjectType}
        options={[...projectTypeOptions]}
        error={state.fieldErrors?.projectType}
      />

      <Select
        name="budgetRange"
        label="Budget range"
        placeholder="Prefer not to say yet"
        hint="Optional, but it helps us scope a response faster — not a filter."
        value={budgetRange}
        onValueChange={setBudgetRange}
        options={[...budgetRangeOptions]}
        error={state.fieldErrors?.budgetRange}
      />

      <Textarea
        name="message"
        label="What are you building?"
        hint="A couple of sentences on the problem is enough to start."
        required
        rows={6}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        error={state.fieldErrors?.message}
      />

      {state.formError && <Alert variant="danger">{state.formError}</Alert>}

      <Button type="submit" size="lg" isLoading={isPending} className="w-full sm:w-auto">
        Send message
      </Button>
    </form>
  );
}
