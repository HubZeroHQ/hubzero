'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input, fieldClassName } from '@/components/ui/Input';
import { submitCareerInterest } from '@/lib/public/career-interest-action';
import { INITIAL_CAREER_INTEREST_STATE } from '@/lib/public/career-interest';
import { cn } from '@/lib/utils/cn';

/**
 * The candidate-interest form — shown on the Careers index when there are no
 * open roles, and on every Career detail page regardless of state. Same
 * honeypot/confirmation shape as `ContactForm`, since both are public
 * lead-capture forms with identical spam-resistance needs.
 */
export function CareerInterestForm({
  careerSlug,
  startedAt,
}: {
  /**
   * Set when submitted from a specific listing's page — omitted for the
   * general "introduce yourself" case. Public DTOs never carry a Career's
   * raw database id (`repository.ts` strips it, same as every other public
   * entity), so the form submits the slug and the server action resolves it
   * to a real id before storing `CareerInterest.careerId`.
   */
  careerSlug?: string;
  startedAt: number;
}) {
  const [state, action] = useActionState(submitCareerInterest, INITIAL_CAREER_INTEREST_STATE);
  const statusRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (state.status !== 'idle') statusRef.current?.focus();
  }, [state.status]);

  if (state.status === 'success') {
    return (
      <section
        ref={statusRef}
        tabIndex={-1}
        className="contact-confirmation"
        aria-labelledby="career-interest-confirmation-title"
        aria-live="polite"
      >
        <p className="home-eyebrow">Submission / received</p>
        <h2 id="career-interest-confirmation-title">Thanks — we&rsquo;ve got it.</h2>
        <p>
          Every submission is reviewed by a real person. If there&rsquo;s a fit, HubZero will use
          the email you provided to follow up.
        </p>
      </section>
    );
  }

  return (
    <form action={action} className="contact-form" noValidate>
      {careerSlug ? <input type="hidden" name="careerSlug" value={careerSlug} /> : null}
      <input type="hidden" name="startedAt" value={startedAt} />
      <div className="contact-honeypot" aria-hidden="true">
        <label htmlFor="career-interest-website">Website</label>
        <input
          id="career-interest-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {state.status === 'error' ? (
        <section
          ref={statusRef}
          tabIndex={-1}
          role="alert"
          className="contact-error-summary"
          aria-labelledby="career-interest-error-title"
        >
          <h2 id="career-interest-error-title">The submission was not sent.</h2>
          <p>{state.message}</p>
        </section>
      ) : null}

      <Field label="Name" name="name" error={state.fieldErrors?.name}>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          maxLength={100}
          defaultValue={state.values.name}
        />
      </Field>
      <Field label="Email" name="email" error={state.fieldErrors?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          maxLength={254}
          defaultValue={state.values.email}
        />
      </Field>
      <Field
        label="Resume"
        name="resumeUrl"
        hint="A link — Google Drive, Dropbox, or similar."
        error={state.fieldErrors?.resumeUrl}
      >
        <Input
          id="resumeUrl"
          name="resumeUrl"
          type="url"
          maxLength={500}
          defaultValue={state.values.resumeUrl}
        />
      </Field>
      <Field label="Portfolio" name="portfolioUrl" error={state.fieldErrors?.portfolioUrl}>
        <Input
          id="portfolioUrl"
          name="portfolioUrl"
          type="url"
          maxLength={500}
          defaultValue={state.values.portfolioUrl}
        />
      </Field>
      <Field label="GitHub" name="githubUrl" error={state.fieldErrors?.githubUrl}>
        <Input
          id="githubUrl"
          name="githubUrl"
          type="url"
          maxLength={500}
          defaultValue={state.values.githubUrl}
        />
      </Field>
      <Field label="LinkedIn" name="linkedinUrl" error={state.fieldErrors?.linkedinUrl}>
        <Input
          id="linkedinUrl"
          name="linkedinUrl"
          type="url"
          maxLength={500}
          defaultValue={state.values.linkedinUrl}
        />
      </Field>
      <Field
        label="Areas of interest"
        name="areasOfInterest"
        hint="Comma-separated — e.g. backend systems, AI infrastructure, developer tools."
        error={state.fieldErrors?.areasOfInterest}
      >
        <Input
          id="areasOfInterest"
          name="areasOfInterest"
          type="text"
          maxLength={300}
          defaultValue={state.values.areasOfInterest}
        />
      </Field>
      <Field
        label="Introduce yourself"
        name="introduction"
        hint="What you work on, what you're looking for, and why HubZero."
        error={state.fieldErrors?.introduction}
      >
        <textarea
          id="introduction"
          name="introduction"
          required
          maxLength={3_000}
          rows={7}
          defaultValue={state.values.introduction}
          className={cn(fieldClassName, 'min-h-40 resize-y')}
        />
      </Field>
      <CareerInterestSubmit />
    </form>
  );
}

function CareerInterestSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? 'Sending…' : 'Submit interest'}
    </Button>
  );
}
