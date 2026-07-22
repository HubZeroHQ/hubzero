import {
  Blocks,
  Box,
  FlaskConical,
  Handshake,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  NotebookPen,
  Settings as SettingsIcon,
  Tags,
  Users,
  UserCog,
  UserRoundSearch,
  Briefcase,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/types/studio';

/**
 * CMS_PRODUCT_DESIGN.md §1 — the IA tree, expressed as data rather than
 * scattered per-page nav markup (`.hubzero/principles.md` — Configuration
 * Over Hardcoding). Two levels maximum: a top-level entry is either a
 * single destination (Dashboard, Leads) or a labeled group of collection
 * destinations (Content, Studio, Library, Settings) — no collection is
 * ever nested under another collection.
 */
export interface StudioNavLeaf {
  kind: 'leaf';
  label: string;
  href: string;
  icon: LucideIcon;
  resource?: {
    label: string;
    detail: boolean;
    create: boolean;
    edit: boolean;
  };
}

interface StudioNavGroup {
  kind: 'group';
  label: string;
  href?: string;
  items: StudioNavLeaf[];
}

export type StudioNavEntry = StudioNavLeaf | StudioNavGroup;

function leaf(
  label: string,
  href: string,
  icon: LucideIcon,
  resource?: StudioNavLeaf['resource'],
): StudioNavLeaf {
  return { kind: 'leaf', label, href, icon, resource };
}

function resource(
  label: string,
  capabilities: Partial<
    Pick<NonNullable<StudioNavLeaf['resource']>, 'detail' | 'create' | 'edit'>
  > = {},
): NonNullable<StudioNavLeaf['resource']> {
  return {
    label,
    detail: capabilities.detail ?? true,
    create: capabilities.create ?? true,
    edit: capabilities.edit ?? true,
  };
}

const DASHBOARD = leaf('Dashboard', '/studio/dashboard', LayoutDashboard);

const CONTENT: StudioNavGroup = {
  kind: 'group',
  label: 'Content',
  items: [
    leaf('Work', '/studio/content/work', Briefcase, resource('Work')),
    leaf('Builds', '/studio/content/builds', Box, resource('Build')),
    leaf('Blueprints', '/studio/content/blueprints', Blocks, resource('Blueprint')),
    leaf('Labs', '/studio/content/labs', FlaskConical, resource('Lab')),
    leaf('Notes', '/studio/content/notes', NotebookPen, resource('Note')),
  ],
};

const STUDIO: StudioNavGroup = {
  kind: 'group',
  label: 'Studio',
  items: [
    leaf('Team', '/studio/team', Users, resource('Team member')),
    leaf(
      'Engineering Profiles',
      '/studio/engineering-profiles',
      UserRoundSearch,
      resource('Engineering profile'),
    ),
    leaf('Services', '/studio/services', Handshake, resource('Service')),
  ],
};

const LEADS = leaf(
  'Leads',
  '/studio/leads',
  Inbox,
  resource('Lead', { create: false, edit: false }),
);

const LIBRARY: StudioNavGroup = {
  kind: 'group',
  label: 'Library',
  items: [
    leaf(
      'Media',
      '/studio/library/media',
      ImageIcon,
      resource('Media asset', { create: false, edit: false }),
    ),
    leaf(
      'Taxonomy',
      '/studio/library/taxonomy',
      Tags,
      resource('Taxonomy term', { detail: false }),
    ),
  ],
};

const SETTINGS: StudioNavGroup = {
  kind: 'group',
  label: 'Settings',
  items: [
    leaf('Users', '/studio/settings/users', UserCog, resource('User')),
    leaf('System', '/studio/settings/system', SettingsIcon),
  ],
};

const PROFILE = leaf('Profile', '/studio/profile', UserCog);
const PROFILE_SETTINGS: StudioNavGroup = {
  kind: 'group',
  label: 'Profile',
  href: PROFILE.href,
  items: [leaf('Change password', '/studio/profile/change-password', UserCog)],
};

/**
 * §8's permissions table translated into what's literally on screen:
 * Settings is structurally invisible to anyone but Head Admin (not just
 * access-controlled), and Leads is hidden from a Member unless at
 * least one Lead is actually assigned to them — computed by the caller
 * (a Member with zero assignments has nothing to do there today).
 */
export function getVisibleNav(
  role: UserRole,
  opts: { hasAssignedLeads: boolean },
): StudioNavEntry[] {
  const entries: StudioNavEntry[] = [DASHBOARD, CONTENT, STUDIO];

  if (role !== 'member' || opts.hasAssignedLeads) {
    entries.push(LEADS);
  }

  entries.push(LIBRARY);

  if (role === 'headAdmin') {
    entries.push(SETTINGS);
  }

  return entries;
}

/** Every leaf, regardless of role — used to resolve breadcrumbs/titles for the current route. */
const ALL_ENTRIES: StudioNavEntry[] = [
  DASHBOARD,
  CONTENT,
  STUDIO,
  LEADS,
  LIBRARY,
  SETTINGS,
  PROFILE,
  PROFILE_SETTINGS,
];

interface ResolvedNavLocation {
  /** Semantic groups are linked only when route metadata declares a real destination. */
  group?: { label: string; href?: string };
  leaf: StudioNavLeaf;
  remainder: string[];
}

/** Finds the group + leaf a given Studio pathname belongs to, for breadcrumbs and the page title. */
function resolveNavLocation(pathname: string): ResolvedNavLocation | undefined {
  for (const entry of ALL_ENTRIES) {
    if (entry.kind === 'leaf') {
      const remainder = routeRemainder(pathname, entry);
      if (remainder) {
        return { leaf: entry, remainder };
      }
    } else {
      for (const item of entry.items) {
        const remainder = routeRemainder(pathname, item);
        if (remainder) {
          return {
            group: { label: entry.label, href: entry.href },
            leaf: item,
            remainder,
          };
        }
      }
    }
  }
  return undefined;
}

function routeRemainder(pathname: string, leaf: StudioNavLeaf): string[] | undefined {
  if (pathname === leaf.href) {
    return [];
  }
  if (!leaf.resource || !pathname.startsWith(`${leaf.href}/`)) {
    return undefined;
  }

  const remainder = pathname
    .slice(leaf.href.length + 1)
    .split('/')
    .filter(Boolean);
  if (remainder.length === 1 && remainder[0] === 'new') {
    return leaf.resource.create ? remainder : undefined;
  }
  if (remainder.length === 1) {
    return leaf.resource.detail ? remainder : undefined;
  }
  if (remainder.length === 2 && remainder[1] === 'edit') {
    return leaf.resource.edit ? remainder : undefined;
  }
  return undefined;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * CMS_PRODUCT_DESIGN.md §2 breadcrumb shape (`Group > Collection > Entry >
 * Document role`), truncated to however deep the current view actually is.
 * Only metadata-backed destinations receive links; non-page hierarchy nodes
 * remain plain text rather than borrowing or fabricating a route.
 */
export function getBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const location = resolveNavLocation(pathname);
  if (!location) {
    return [];
  }
  const items: BreadcrumbItem[] = [];
  if (location.group) {
    items.push(
      location.group.href
        ? { label: location.group.label, href: location.group.href }
        : { label: location.group.label },
    );
  }
  items.push({ label: location.leaf.label, href: location.leaf.href });
  const [resourceId, action] = location.remainder;
  if (resourceId === 'new') {
    items.push({ label: 'New' });
  } else if (resourceId && location.leaf.resource) {
    items.push({
      label: location.leaf.resource.label,
      href: location.leaf.resource.detail ? `${location.leaf.href}/${resourceId}` : undefined,
    });
    if (action === 'edit') {
      items.push({ label: 'Edit' });
    }
  }
  return items;
}

/** Flattens a (role-filtered) nav tree into its leaves — the command palette's "Go to" quick actions. */
export function flattenNav(nav: StudioNavEntry[]): StudioNavLeaf[] {
  return nav.flatMap((entry) => (entry.kind === 'leaf' ? [entry] : entry.items));
}
