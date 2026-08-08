'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import type { LeadStatus } from '@/types/studio';

const STATUSES: LeadStatus[] = ['new', 'contacted', 'closed'];
const STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  closed: 'Closed',
};

/** Three plain buttons for Lead's linear `new → contacted → closed` (§26.8) — not the five-state Content `StatusStepper`, which assumes the publish workflow's transition rules. */
export function LeadStatusButtons({
  leadId,
  status,
  action,
}: {
  leadId: string;
  status: LeadStatus;
  action: (id: string, status: LeadStatus) => Promise<{ error?: string } | void>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const inFlightRef = useRef(false);

  function handleClick(candidate: LeadStatus) {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    startTransition(async () => {
      try {
        const result = await action(leadId, candidate);
        setError(result?.error);
        if (!result?.error) {
          router.refresh();
        }
      } finally {
        inFlightRef.current = false;
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {error ? (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        {STATUSES.map((candidate) => (
          <Button
            key={candidate}
            type="button"
            variant={candidate === status ? 'primary' : 'secondary'}
            disabled={pending || candidate === status}
            onClick={() => handleClick(candidate)}
          >
            {STATUS_LABEL[candidate]}
          </Button>
        ))}
      </div>
    </div>
  );
}
