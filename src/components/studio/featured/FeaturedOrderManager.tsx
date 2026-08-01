'use client';

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlertTriangle, ArrowDown, ArrowUp, Check, GripVertical, Plus, X } from 'lucide-react';
import { useMemo, useState, useTransition } from 'react';
import { SaveStateIndicator } from '@/components/studio/editor/SaveStateIndicator';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { ReferenceIdBadge } from '@/components/ui/ReferenceIdBadge';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { setFeaturedOrderAction } from '@/lib/studio/actions/featured-order';
import type {
  FeaturedCollectionEntry,
  HomepageAppearance,
} from '@/lib/studio/featured-collections';
import {
  addFeaturedId,
  moveItem,
  moveItemBy,
  removeFeaturedId,
  selectFeatured,
} from '@/lib/studio/featured-order';
import { useEditorRegistration } from '@/lib/studio/editor-state/use-editor-registration';
import type { EditorSaveStatus } from '@/lib/studio/editor-state/types';
import { PUBLISH_WORKFLOW_ORDER } from '@/config/workflow';
import { cn } from '@/lib/utils/cn';
import type { PublishStatus } from '@/types/studio';

/**
 * The Featured Order screen (v3.1 Milestone 2) — a dedicated surface for one
 * editorial decision, not inline editing inside a collection table.
 *
 * The separation is deliberate. Featured order is a property of the *set*, not
 * of any one entry: moving one item renumbers its neighbours. A control that
 * lived in the table row would let an editor change a global sequence while
 * only ever seeing one row of it, which is how "position 4" and "position 4"
 * end up on two different records. Here the whole ordered list is on screen,
 * and the save writes it as one set.
 *
 * Local state is a plain ordered array of ids. Positions are never stored in
 * component state — they are rendered from index, exactly as the server
 * derives them on write, so what the editor sees numbered `1..N` is what gets
 * persisted.
 */
export function FeaturedOrderManager({
  collectionKey,
  singular,
  surface,
  entries,
}: {
  collectionKey: string;
  singular: string;
  /** Where this order shows up publicly — stated plainly so the effect of featuring is never inferred. */
  surface: string;
  entries: FeaturedCollectionEntry[];
}) {
  const entriesById = useMemo(() => new Map(entries.map((entry) => [entry.id, entry])), [entries]);

  const savedOrder = useMemo(() => selectFeatured(entries).map((entry) => entry.id), [entries]);

  const [orderedIds, setOrderedIds] = useState<string[]>(savedOrder);
  const [baseline, setBaseline] = useState<string[]>(savedOrder);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PublishStatus | 'all'>('all');
  const [error, setError] = useState<string | undefined>();
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [pending, startTransition] = useTransition();
  /** Mirrors the drag/keyboard announcement region so screen-reader users get the same feedback pointer users get from motion. */
  const [announcement, setAnnouncement] = useState('');

  const isDirty =
    orderedIds.length !== baseline.length || orderedIds.some((id, index) => id !== baseline[index]);

  const featured = orderedIds
    .map((id) => entriesById.get(id))
    .filter((entry): entry is FeaturedCollectionEntry => entry !== undefined);

  const available = entries
    .filter((entry) => !orderedIds.includes(entry.id))
    .filter((entry) => (statusFilter === 'all' ? true : entry.status === statusFilter))
    .filter((entry) => {
      const term = query.trim().toLowerCase();
      if (!term) return true;
      return (
        entry.label.toLowerCase().includes(term) || entry.referenceId.toLowerCase().includes(term)
      );
    })
    .sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function announceMove(label: string, toIndex: number, total: number) {
    setAnnouncement(`${label} moved to position ${toIndex + 1} of ${total}.`);
  }

  function handleMoveBy(index: number, delta: number) {
    setOrderedIds((current) => {
      const next = moveItemBy(current, index, delta);
      const entry = entriesById.get(current[index] as string);
      const toIndex = next.indexOf(current[index] as string);
      if (entry) announceMove(entry.label, toIndex, next.length);
      return next;
    });
  }

  function handleAdd(id: string) {
    setOrderedIds((current) => {
      const next = addFeaturedId(current, id);
      const entry = entriesById.get(id);
      if (entry) {
        setAnnouncement(`${entry.label} added to featured at position ${next.length}.`);
      }
      return next;
    });
  }

  function handleRemove(id: string) {
    setOrderedIds((current) => {
      const entry = entriesById.get(id);
      if (entry) setAnnouncement(`${entry.label} removed from featured.`);
      return removeFeaturedId(current, id);
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrderedIds((current) => {
      const from = current.indexOf(String(active.id));
      const to = current.indexOf(String(over.id));
      if (from === -1 || to === -1) return current;
      return moveItem(current, from, to);
    });
  }

  function save(): Promise<boolean> {
    return new Promise((resolve) => {
      startTransition(async () => {
        setError(undefined);
        const result = await setFeaturedOrderAction(collectionKey, orderedIds);
        if (result.error) {
          setError(result.error);
          resolve(false);
          return;
        }
        setBaseline(orderedIds);
        setSavedAt(new Date());
        setAnnouncement('Featured order saved.');
        resolve(true);
      });
    });
  }

  function discard() {
    setOrderedIds(baseline);
    setError(undefined);
    setAnnouncement('Featured order changes discarded.');
  }

  const status: EditorSaveStatus = pending
    ? 'saving'
    : error
      ? 'error'
      : isDirty
        ? 'dirty'
        : 'saved';

  // Joins the shared editor-state system (v3.1 Milestone 1), so an unsaved
  // reorder is protected by the same navigation guard, sticky save bar and
  // unload warning as every other Studio editor — this screen does not need
  // its own answer to "you have unsaved changes".
  useEditorRegistration({
    id: `featured-order-${collectionKey}`,
    label: `${singular} featured order`,
    isDirty,
    status,
    error,
    save,
    discard,
    savesAutomatically: false,
    showsSaveBar: true,
    canDiscard: !pending,
  });

  return (
    <div className="flex flex-col gap-8">
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {error ? (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      ) : null}

      <section className="flex flex-col gap-3" aria-labelledby="featured-list-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 id="featured-list-title" className="text-text-primary text-sm font-semibold">
              Featured — leads the collection
            </h2>
            <p className="text-text-secondary text-xs">
              These entries appear first on the public collection page, in this order. The
              highest-ranked eligible ones also fill {surface}. Lower numbers appear first — drag a
              row, or use the Move up / Move down buttons.
            </p>
          </div>
          <SaveStateIndicator status={status} lastSavedAt={savedAt} error={error} />
        </div>

        {featured.length > 0 && featured.every((entry) => entry.homepage.kind !== 'eligible') ? (
          <p role="status" className="text-danger text-xs">
            None of the entries below currently qualify for the homepage, so {surface} will render
            empty. They still lead the public collection page. Featuring an entry does not override
            the eligibility rules.
          </p>
        ) : null}

        {featured.length === 0 ? (
          <EmptyState
            title={`No featured ${singular} entries.`}
            description={`Nothing from this collection appears on ${surface} until you add it below.`}
          />
        ) : (
          <DndContext
            id={`featured-order-${collectionKey}`}
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            onDragEnd={handleDragEnd}
            accessibility={{
              announcements: {
                onDragStart: ({ active }) =>
                  `Picked up ${entriesById.get(String(active.id))?.label ?? 'entry'}.`,
                onDragOver: ({ over }) =>
                  over
                    ? `Moved to position ${orderedIds.indexOf(String(over.id)) + 1} of ${orderedIds.length}.`
                    : undefined,
                onDragEnd: ({ over }) => (over ? 'Dropped.' : 'Reorder cancelled.'),
                onDragCancel: () => 'Reorder cancelled.',
              },
            }}
          >
            <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
              <ol className="border-border-default divide-border-muted divide-y rounded-[4px] border">
                {featured.map((entry, index) => (
                  <FeaturedRow
                    key={entry.id}
                    entry={entry}
                    index={index}
                    total={featured.length}
                    onMoveUp={() => handleMoveBy(index, -1)}
                    onMoveDown={() => handleMoveBy(index, 1)}
                    onRemove={() => handleRemove(entry.id)}
                  />
                ))}
              </ol>
            </SortableContext>
          </DndContext>
        )}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="available-list-title">
        <h2 id="available-list-title" className="text-text-primary text-sm font-semibold">
          Not featured
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${singular} entries…`}
            aria-label={`Search ${singular} entries`}
            className="max-w-xs"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as PublishStatus | 'all')}
            aria-label="Filter by status"
            className="bg-surface-default text-text-primary border-border-subtle rounded-[4px] border px-3 py-2 text-sm"
          >
            <option value="all">All statuses</option>
            {PUBLISH_WORKFLOW_ORDER.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        {available.length === 0 ? (
          <p className="text-text-muted text-sm">No entries match.</p>
        ) : (
          <ul className="border-border-default divide-border-muted divide-y rounded-[4px] border">
            {available.map((entry) => (
              <li key={entry.id} className="flex items-center gap-3 px-3 py-2">
                <span className="text-text-primary min-w-0 flex-1 truncate text-sm">
                  {entry.label}
                </span>
                <HomepageAppearanceBadge appearance={entry.homepage} />
                <ReferenceIdBadge referenceId={entry.referenceId} />
                <StatusIndicator status={entry.status} />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleAdd(entry.id)}
                  aria-label={`Add ${entry.label} to featured`}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  Feature
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/**
 * One featured row. Drag is offered through a dedicated handle rather than the
 * whole row, so the row's own buttons stay clickable — and because a drag
 * handle is the only affordance that reads as draggable without motion.
 *
 * Move up / Move down are not a fallback for drag; they are a first-class,
 * fully equivalent path. Every reorder is reachable by keyboard twice over:
 * these buttons, and dnd-kit's own lift-and-move flow on the handle.
 */
function FeaturedRow({
  entry,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  entry: FeaturedCollectionEntry;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: entry.id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'bg-surface-default flex items-center gap-3 px-3 py-2',
        isDragging && 'relative z-10 opacity-80',
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${entry.label}`}
        className="text-text-muted hover:text-text-primary rounded-control cursor-grab p-1"
      >
        <GripVertical className="h-4 w-4" aria-hidden />
      </button>

      <span
        aria-hidden
        className="text-text-muted w-6 shrink-0 text-center font-mono text-xs tabular-nums"
      >
        {index + 1}
      </span>

      <span className="text-text-primary min-w-0 flex-1 truncate text-sm">
        <span className="sr-only">
          Position {index + 1} of {total}:{' '}
        </span>
        {entry.label}
      </span>

      <HomepageAppearanceBadge appearance={entry.homepage} />
      <ReferenceIdBadge referenceId={entry.referenceId} />
      <StatusIndicator status={entry.status} />

      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          onClick={onMoveUp}
          disabled={index === 0}
          aria-label={`Move ${entry.label} up`}
        >
          <ArrowUp className="h-3.5 w-3.5" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onMoveDown}
          disabled={index === total - 1}
          aria-label={`Move ${entry.label} down`}
        >
          <ArrowDown className="h-3.5 w-3.5" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onRemove}
          aria-label={`Remove ${entry.label} from featured`}
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </Button>
      </div>
    </li>
  );
}

/**
 * States plainly whether featuring this entry will actually put it on the
 * homepage. The reason text comes from the public layer's own predicate — the
 * Studio never restates the rules in its own words, so the two cannot drift.
 */
function HomepageAppearanceBadge({ appearance }: { appearance: HomepageAppearance }) {
  if (appearance.kind === 'eligible') {
    return (
      <span className="text-success inline-flex shrink-0 items-center gap-1 text-xs">
        <Check className="h-3 w-3" aria-hidden />
        Appears
      </span>
    );
  }

  const label =
    appearance.kind === 'notPublished'
      ? 'Not published — will not appear'
      : `Will not appear — ${appearance.reason}`;

  return (
    <span title={label} className="text-text-muted inline-flex shrink-0 items-center gap-1 text-xs">
      <AlertTriangle className="h-3 w-3" aria-hidden />
      {appearance.kind === 'notPublished' ? 'Not published' : 'Won’t appear'}
      <span className="sr-only">— {label}</span>
    </span>
  );
}
