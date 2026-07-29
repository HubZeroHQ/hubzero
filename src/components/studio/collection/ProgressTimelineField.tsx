'use client';

import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { fieldClassName, Input } from '@/components/ui/Input';

export interface ProgressTimelineMilestoneValue {
  title: string;
  /** `YYYY-MM-DD`, matching `<input type="date">`. */
  date: string;
  summary: string;
  relatedDocumentRole?: string;
}

export interface ProgressTimelineRoleOption {
  value: string;
  label: string;
}

/**
 * The editor for a collection entry's Progress Timeline (Phase 10) — a
 * lightweight, ordered milestone list (title, date, short summary, optional
 * related Document) built generic enough for a future collection to reuse,
 * not as Labs-specific infrastructure. Submits as one JSON-serialized hidden
 * input under `name`, parsed server-side (`lib/studio/actions/lab.ts`'s
 * `readMilestones`) — a structured array doesn't fit the repeated-hidden-
 * input pattern `RelationMultiSelect`/`MediaGalleryField` use for flat lists
 * of ids, so this is the one field in the Studio's native-`FormData`
 * convention that crosses the boundary as JSON instead.
 */
export function ProgressTimelineField({
  name,
  initialMilestones = [],
  documentRoleOptions = [],
}: {
  name: string;
  initialMilestones?: ProgressTimelineMilestoneValue[];
  documentRoleOptions?: ProgressTimelineRoleOption[];
}) {
  const [milestones, setMilestones] = useState<ProgressTimelineMilestoneValue[]>(initialMilestones);

  function updateMilestone(index: number, patch: Partial<ProgressTimelineMilestoneValue>) {
    setMilestones((prev) =>
      prev.map((milestone, i) => (i === index ? { ...milestone, ...patch } : milestone)),
    );
  }

  function addMilestone() {
    setMilestones((prev) => [
      ...prev,
      { title: '', date: '', summary: '', relatedDocumentRole: '' },
    ]);
  }

  function removeMilestone(index: number) {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(
          milestones.map((milestone) => ({
            ...milestone,
            relatedDocumentRole: milestone.relatedDocumentRole || undefined,
          })),
        )}
      />

      {milestones.length === 0 ? (
        <p className="text-text-muted text-sm">No milestones yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {milestones.map((milestone, index) => (
            <div
              key={index}
              className="border-border-default rounded-card flex flex-col gap-2 border p-3"
            >
              <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                <Input
                  aria-label="Milestone title"
                  placeholder="Milestone title"
                  value={milestone.title}
                  onChange={(event) => updateMilestone(index, { title: event.target.value })}
                />
                <Input
                  aria-label="Milestone date"
                  type="date"
                  value={milestone.date}
                  onChange={(event) => updateMilestone(index, { date: event.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  aria-label="Remove milestone"
                  onClick={() => removeMilestone(index)}
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </Button>
              </div>
              <textarea
                aria-label="Milestone summary"
                placeholder="Short summary"
                value={milestone.summary}
                onChange={(event) => updateMilestone(index, { summary: event.target.value })}
                rows={2}
                className={fieldClassName}
              />
              {documentRoleOptions.length > 0 ? (
                <select
                  aria-label="Related document"
                  value={milestone.relatedDocumentRole ?? ''}
                  onChange={(event) =>
                    updateMilestone(index, { relatedDocumentRole: event.target.value })
                  }
                  className={fieldClassName}
                >
                  <option value="">No related document</option>
                  {documentRoleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <Button type="button" variant="secondary" onClick={addMilestone} className="self-start">
        <Plus className="h-3.5 w-3.5" aria-hidden />
        Add milestone
      </Button>
    </div>
  );
}
