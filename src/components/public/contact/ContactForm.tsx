'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input, fieldClassName } from '@/components/ui/Input';
import { PUBLIC_CONTACT } from '@/config/public-site';
import { submitContact } from '@/lib/public/contact-action';
import { INITIAL_CONTACT_STATE } from '@/lib/public/contact';
import { cn } from '@/lib/utils/cn';

export function ContactForm({ source, startedAt }: { source: string; startedAt: number }) {
  const [state, action] = useActionState(submitContact, INITIAL_CONTACT_STATE);
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
        aria-labelledby="contact-confirmation-title"
        aria-live="polite"
      >
        <p className="home-eyebrow">Submission / received</p>
        <h2 id="contact-confirmation-title">Message received.</h2>
        <p>{PUBLIC_CONTACT.reviewStatement}</p>
        <ol>
          <li>
            <span>01</span>
            <div>
              <h3>Received</h3>
              <p>The submission flow is complete.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Review</h3>
              <p>The problem, context, and constraints will be considered together.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Continue when useful</h3>
              <p>
                If additional discussion would be valuable, HubZero will use the email provided.
              </p>
            </div>
          </li>
        </ol>
      </section>
    );
  }

  return (
    <form action={action} className="contact-form" noValidate>
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="startedAt" value={startedAt} />
      <div className="contact-honeypot" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === 'error' ? (
        <section
          ref={statusRef}
          tabIndex={-1}
          role="alert"
          className="contact-error-summary"
          aria-labelledby="contact-error-title"
        >
          <h2 id="contact-error-title">The message was not sent.</h2>
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
        label="What would be useful to discuss?"
        name="message"
        hint="Include the problem, who it affects, current constraints, and anything already tried."
        error={state.fieldErrors?.message}
      >
        <textarea
          id="message"
          name="message"
          required
          maxLength={5_000}
          rows={9}
          defaultValue={state.values.message}
          className={cn(fieldClassName, 'min-h-48 resize-y')}
        />
      </Field>
      <p className="contact-privacy">{PUBLIC_CONTACT.privacy}</p>
      <ContactSubmit />
    </form>
  );
}

function ContactSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? 'Sending message…' : 'Send message'}
    </Button>
  );
}
