"use client";

import { useEffect, useState, useTransition } from "react";

import {
  addNoteComment,
  getComments,
  getMentionableUsers,
  toggleCommentResolved,
  type MentionableUser,
} from "@/actions/studio/comments";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import type { ClientComment } from "@/lib/cms/comments";
import { cn } from "@/lib/utils";
import type { Resource } from "@/types/cms";

export interface CommentThreadProps {
  resource: Resource;
  documentId: string;
}

interface ComposerProps {
  mentionableUsers: MentionableUser[];
  placeholder: string;
  submitLabel: string;
  onSubmit: (body: string, mentions: string[]) => Promise<void>;
  onCancel?: () => void;
}

function Composer({
  mentionableUsers,
  placeholder,
  submitLabel,
  onSubmit,
  onCancel,
}: ComposerProps) {
  const [body, setBody] = useState("");
  const [mentions, setMentions] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  function toggleMention(id: string) {
    setMentions((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  }

  function handleSubmit() {
    startTransition(async () => {
      await onSubmit(body, mentions);
      setBody("");
      setMentions([]);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={placeholder}
        rows={3}
      />
      {mentionableUsers.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <Text size="caption" tone="muted">
            Mention:
          </Text>
          {mentionableUsers.map((mentionable) =>
            mentions.includes(mentionable.id) ? (
              <Chip
                key={mentionable.id}
                tone="accent"
                onRemove={() => toggleMention(mentionable.id)}
              >
                {mentionable.name}
              </Chip>
            ) : (
              <button
                key={mentionable.id}
                type="button"
                onClick={() => toggleMention(mentionable.id)}
                className="border-border-muted text-text-muted hover:text-text text-caption rounded-full border px-3 py-1"
              >
                {mentionable.name}
              </button>
            ),
          )}
        </div>
      )}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          size="sm"
          isLoading={isPending}
          disabled={!body.trim()}
          onClick={handleSubmit}
        >
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

function CommentRow({
  comment,
  replies,
  onReply,
  onToggleResolved,
  activeReplyId,
  mentionableUsers,
  onSubmitReply,
}: {
  comment: ClientComment;
  replies: ClientComment[];
  onReply: (id: string | null) => void;
  onToggleResolved: (id: string) => void;
  activeReplyId: string | null;
  mentionableUsers: MentionableUser[];
  onSubmitReply: (parentId: string, body: string, mentions: string[]) => Promise<void>;
}) {
  return (
    <li
      className={cn("border-border-muted rounded-md border p-3", comment.resolved && "opacity-60")}
    >
      <div className="flex items-center justify-between gap-3">
        <Text weight="medium" size="caption">
          {comment.authorName}
        </Text>
        <Text size="caption" tone="muted">
          {new Date(comment.createdAt).toLocaleString()}
        </Text>
      </div>
      <Text size="caption" className="mt-1 whitespace-pre-wrap">
        {comment.body}
      </Text>
      {comment.mentions.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {comment.mentions.map((mentionId) => {
            const mentioned = mentionableUsers.find((u) => u.id === mentionId);
            return mentioned ? (
              <Chip key={mentionId} tone="accent">
                @{mentioned.name}
              </Chip>
            ) : null;
          })}
        </div>
      )}
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => onToggleResolved(comment.id)}
          aria-pressed={comment.resolved}
          className="text-caption text-text-muted hover:text-text"
        >
          {comment.resolved ? "Reopen" : "Resolve"}
        </button>
        <button
          type="button"
          onClick={() => onReply(activeReplyId === comment.id ? null : comment.id)}
          aria-expanded={activeReplyId === comment.id}
          className="text-caption text-text-muted hover:text-text"
        >
          Reply
        </button>
      </div>

      {replies.length > 0 && (
        <ul className="border-border-muted mt-3 flex flex-col gap-3 border-l pl-4">
          {replies.map((reply) => (
            <li key={reply.id}>
              <div className="flex items-center justify-between gap-3">
                <Text weight="medium" size="caption">
                  {reply.authorName}
                </Text>
                <Text size="caption" tone="muted">
                  {new Date(reply.createdAt).toLocaleString()}
                </Text>
              </div>
              <Text size="caption" className="mt-1 whitespace-pre-wrap">
                {reply.body}
              </Text>
            </li>
          ))}
        </ul>
      )}

      {activeReplyId === comment.id && (
        <div className="mt-3">
          <Composer
            mentionableUsers={mentionableUsers}
            placeholder="Write a reply…"
            submitLabel="Reply"
            onCancel={() => onReply(null)}
            onSubmit={async (body, mentions) => {
              await onSubmitReply(comment.id, body, mentions);
              onReply(null);
            }}
          />
        </div>
      )}
    </li>
  );
}

/**
 * The generic threaded comment surface (Phase D) — one component, mounted on
 * every editable document's edit screen, keyed by `{resource, documentId}`
 * exactly like `VersionHistory`/review comments already are
 * (`lib/cms/comments.ts`). No collection-specific variant exists or is
 * needed: everything it needs (author, mentions, replies, resolved) is
 * already generic on the `Comment` model.
 */
export function CommentThread({ resource, documentId }: CommentThreadProps) {
  const [comments, setComments] = useState<ClientComment[]>([]);
  const [mentionableUsers, setMentionableUsers] = useState<MentionableUser[]>([]);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  function refresh() {
    getComments(resource, documentId).then((results) => {
      setComments(results.filter((comment) => comment.type === "note"));
      setLoaded(true);
    });
  }

  useEffect(() => {
    refresh();
    getMentionableUsers().then(setMentionableUsers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource, documentId]);

  async function handleToggleResolved(id: string) {
    await toggleCommentResolved(id);
    refresh();
  }

  async function handleTopLevelSubmit(body: string, mentions: string[]) {
    await addNoteComment(resource, documentId, body, undefined, mentions);
    refresh();
  }

  async function handleReplySubmit(parentId: string, body: string, mentions: string[]) {
    await addNoteComment(resource, documentId, body, parentId, mentions);
    refresh();
  }

  const topLevel = comments.filter((comment) => !comment.parentId);
  const repliesByParent = new Map<string, ClientComment[]>();
  for (const comment of comments) {
    if (!comment.parentId) continue;
    const list = repliesByParent.get(comment.parentId) ?? [];
    list.push(comment);
    repliesByParent.set(comment.parentId, list);
  }

  return (
    <div className="flex flex-col gap-4">
      {loaded && topLevel.length === 0 && (
        <Text size="caption" tone="muted">
          No comments yet.
        </Text>
      )}
      {topLevel.length > 0 && (
        <ul className="flex flex-col gap-3">
          {topLevel.map((comment) => (
            <CommentRow
              key={comment.id}
              comment={comment}
              replies={repliesByParent.get(comment.id) ?? []}
              onReply={setActiveReplyId}
              onToggleResolved={handleToggleResolved}
              activeReplyId={activeReplyId}
              mentionableUsers={mentionableUsers}
              onSubmitReply={handleReplySubmit}
            />
          ))}
        </ul>
      )}
      <Composer
        mentionableUsers={mentionableUsers}
        placeholder="Add a comment…"
        submitLabel="Comment"
        onSubmit={handleTopLevelSubmit}
      />
    </div>
  );
}
