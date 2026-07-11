import { Text } from "@/components/ui/text";
import type { ClientComment } from "@/lib/cms/comments";

export interface CommentListProps {
  comments: ClientComment[];
  emptyMessage: string;
}

/**
 * A flat, read-only render of `lib/cms/comments.ts`'s `ClientComment[]` —
 * shared by Phase C's review-comment history and Phase D's comment thread
 * (which wraps this with its own reply/resolve controls rather than
 * duplicating the "one comment" markup).
 */
export function CommentList({ comments, emptyMessage }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <Text size="caption" tone="muted">
        {emptyMessage}
      </Text>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {comments.map((comment) => (
        <li key={comment.id} className="border-border-muted rounded-md border p-3">
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
        </li>
      ))}
    </ul>
  );
}
