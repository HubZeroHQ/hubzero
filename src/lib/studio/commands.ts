import type { Capability } from '@/config/permissions';
import { roleHasCapability } from '@/config/permissions';
import type { UserRole } from '@/types/studio';
import { flattenNav, type StudioNavEntry } from './navigation';

/**
 * The Command Palette's non-search commands (v3.1 Milestone 6).
 *
 * Deliberately a flat, declarative list rather than a registry with its own
 * lifecycle: every command here is "go to a route the Studio already has".
 * The palette is a *client* of navigation, search, permissions and the editor
 * guard — it owns none of them — so the only thing that needs modelling is the
 * command's own identity, the capability it requires, and where it goes.
 *
 * Two rules keep this from drifting into a second navigation layer:
 *
 * 1. **Every command must have an existing destination.** A command with no
 *    route is an invented feature, and a palette that offers actions the
 *    Studio cannot perform is worse than one that offers fewer.
 * 2. **Permission is expressed as a capability, never as a role.** The
 *    capability table in `config/permissions.ts` is the single source of truth
 *    for who may do what; restating "Admin or Head Admin" here would create a
 *    second one that silently disagrees the first time the table changes.
 */

export type CommandSection = 'navigation' | 'create' | 'actions';

export interface StudioCommand {
  id: string;
  section: CommandSection;
  label: string;
  /** Disambiguates similar labels and gives the palette extra text to match against. */
  hint?: string;
  href: string;
  /** Omitted when every authenticated role may run it. */
  capability?: Capability;
}

/**
 * Create and action commands only.
 *
 * "Go to" is deliberately **absent**: navigation destinations are derived from
 * the same `getVisibleNav` tree the sidebar renders (see
 * `navigationCommands`), so a page added to Studio appears in both places
 * without anyone editing this file. Listing them here as well would be a
 * second navigation model — consistent today, silently divergent the first
 * time someone adds a route to one and not the other.
 *
 * What remains here has no sidebar equivalent: creation entry points and
 * tools an editor invokes rather than places they work.
 */
export const STUDIO_COMMANDS: readonly StudioCommand[] = [
  // — Create ————————————————————————————————————————————————————
  // `createOwnEntry` is held by every authenticated role, but it is stated
  // rather than assumed: if the capability table ever narrows, these
  // disappear from the palette without anyone remembering to edit this file.
  {
    id: 'new-work',
    section: 'create',
    label: 'New Work entry',
    href: '/studio/content/work/new',
    capability: 'createOwnEntry',
  },
  {
    id: 'new-build',
    section: 'create',
    label: 'New Build',
    href: '/studio/content/builds/new',
    capability: 'createOwnEntry',
  },
  {
    id: 'new-blueprint',
    section: 'create',
    label: 'New Blueprint',
    href: '/studio/content/blueprints/new',
    capability: 'createOwnEntry',
  },
  {
    id: 'new-lab',
    section: 'create',
    label: 'New Lab',
    href: '/studio/content/labs/new',
    capability: 'createOwnEntry',
  },
  {
    id: 'new-note',
    section: 'create',
    label: 'New Note',
    href: '/studio/content/notes/new',
    capability: 'createOwnEntry',
  },
  {
    id: 'new-career',
    section: 'create',
    label: 'New Career',
    href: '/studio/content/careers/new',
    capability: 'createOwnEntry',
  },

  // — Actions ———————————————————————————————————————————————————
  { id: 'action-search', section: 'actions', label: 'Studio search', href: '/studio/search' },
  {
    id: 'action-relationship-health',
    section: 'actions',
    label: 'Relationship health',
    hint: 'Find broken references',
    href: '/studio/health/relationships',
    capability: 'editAnyEntry',
  },
  {
    id: 'action-content-health',
    section: 'actions',
    label: 'Content health',
    hint: 'What needs fixing next',
    href: '/studio/dashboard',
    capability: 'publish',
  },
  // Featured Order is per-collection; the palette offers the collections that
  // have one rather than a single "Featured Order" command with no destination.
  {
    id: 'action-featured-work',
    section: 'actions',
    label: 'Featured order — Work',
    href: '/studio/content/work/featured',
    capability: 'publish',
  },
  {
    id: 'action-featured-builds',
    section: 'actions',
    label: 'Featured order — Builds',
    href: '/studio/content/builds/featured',
    capability: 'publish',
  },
  {
    id: 'action-featured-blueprints',
    section: 'actions',
    label: 'Featured order — Blueprints',
    href: '/studio/content/blueprints/featured',
    capability: 'publish',
  },
  {
    id: 'action-featured-labs',
    section: 'actions',
    label: 'Featured order — Labs',
    href: '/studio/content/labs/featured',
    capability: 'publish',
  },
  {
    id: 'action-featured-notes',
    section: 'actions',
    label: 'Featured order — Notes',
    href: '/studio/content/notes/featured',
    capability: 'publish',
  },
];

/**
 * The navigation half of the palette, derived from the sidebar's own tree.
 *
 * `getVisibleNav` has already applied this viewer's role and assignments, so
 * these need no capability of their own — the destinations an editor can see
 * in the sidebar are exactly the ones the palette offers, by construction
 * rather than by two lists agreeing.
 */
export function navigationCommands(nav: readonly StudioNavEntry[]): StudioCommand[] {
  return flattenNav([...nav]).map((leaf) => ({
    id: `nav:${leaf.href}`,
    section: 'navigation' as const,
    label: leaf.label,
    href: leaf.href,
  }));
}

/**
 * Every command this viewer may run: sidebar destinations plus the
 * capability-filtered create/action commands.
 */
export function commandsForRole(
  role: UserRole,
  nav: readonly StudioNavEntry[] = [],
): StudioCommand[] {
  return [
    ...navigationCommands(nav),
    ...STUDIO_COMMANDS.filter(
      (command) => !command.capability || roleHasCapability(role, command.capability),
    ),
  ];
}

/**
 * Matches a command against what the editor has typed.
 *
 * Deliberately simpler than the search index's tiered ranking: the command
 * list is small, fixed and known to the user, so a prefix-or-substring match
 * on the label (plus the hint, so "broken references" finds Relationship
 * health) is enough. Content results keep the shared `rankResults` — this
 * covers only the commands, which are not part of that index.
 */
export function filterCommands(commands: readonly StudioCommand[], query: string): StudioCommand[] {
  const q = query.trim().toLowerCase();
  if (q === '') return [...commands];

  return commands
    .map((command) => {
      const label = command.label.toLowerCase();
      const hint = command.hint?.toLowerCase() ?? '';
      if (label.startsWith(q)) return { command, rank: 0 };
      if (label.split(/[\s—-]+/).some((word) => word.startsWith(q))) return { command, rank: 1 };
      if (label.includes(q) || hint.includes(q)) return { command, rank: 2 };
      return null;
    })
    .filter((entry): entry is { command: StudioCommand; rank: number } => entry !== null)
    .sort(
      (left, right) =>
        left.rank - right.rank || left.command.label.localeCompare(right.command.label),
    )
    .map((entry) => entry.command);
}

export function groupCommands(commands: readonly StudioCommand[]) {
  return (['navigation', 'create', 'actions'] as const)
    .map((section) => ({
      section,
      commands: commands.filter((command) => command.section === section),
    }))
    .filter((group) => group.commands.length > 0);
}

export const COMMAND_SECTION_LABEL: Record<CommandSection, string> = {
  navigation: 'Go to',
  create: 'Create',
  actions: 'Actions',
};
