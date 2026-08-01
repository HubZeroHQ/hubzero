/**
 * One page of activity.
 *
 * Its own module because both the page and the "Load more" Server Action need
 * it, and importing the action's module from a Server Component (or the
 * service's from the client) just to read a number would drag the wrong things
 * across the boundary.
 *
 * Fifty is a screen or two of scrolling — enough that the common question
 * ("what changed today?") is answered without paging at all, small enough that
 * the first paint is not waiting on a thousand rows.
 */
export const ACTIVITY_PAGE_SIZE = 50;
