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
  Briefcase,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/types/cms';

/**
 * CMS_PRODUCT_DESIGN.md §1 — the IA tree, expressed as data rather than
 * scattered per-page nav markup (`.hubzero/principles.md` — Configuration
 * Over Hardcoding). Two levels maximum: a top-level entry is either a
 * single destination (Dashboard, Leads) or a labeled group of collection
 * destinations (Content, Studio, Library, Settings) — no collection is
 * ever nested under another collection.
 */
export interface CmsNavLeaf {
  kind: 'leaf';
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface CmsNavGroup {
  kind: 'group';
  label: string;
  items: CmsNavLeaf[];
}

export type CmsNavEntry = CmsNavLeaf | CmsNavGroup;

function leaf(label: string, href: string, icon: LucideIcon): CmsNavLeaf {
  return { kind: 'leaf', label, href, icon };
}

const DASHBOARD = leaf('Dashboard', '/cms/dashboard', LayoutDashboard);

const CONTENT: CmsNavGroup = {
  kind: 'group',
  label: 'Content',
  items: [
    leaf('Work', '/cms/content/work', Briefcase),
    leaf('Builds', '/cms/content/builds', Box),
    leaf('Blueprints', '/cms/content/blueprints', Blocks),
    leaf('Labs', '/cms/content/labs', FlaskConical),
    leaf('Notes', '/cms/content/notes', NotebookPen),
  ],
};

const STUDIO: CmsNavGroup = {
  kind: 'group',
  label: 'Studio',
  items: [
    leaf('Team', '/cms/studio/team', Users),
    leaf('Services', '/cms/studio/services', Handshake),
  ],
};

const LEADS = leaf('Leads', '/cms/leads', Inbox);

const LIBRARY: CmsNavGroup = {
  kind: 'group',
  label: 'Library',
  items: [
    leaf('Media', '/cms/library/media', ImageIcon),
    leaf('Taxonomy', '/cms/library/taxonomy', Tags),
  ],
};

const SETTINGS: CmsNavGroup = {
  kind: 'group',
  label: 'Settings',
  items: [
    leaf('Users', '/cms/settings/users', UserCog),
    leaf('System', '/cms/settings/system', SettingsIcon),
  ],
};

/**
 * §8's permissions table translated into what's literally on screen:
 * Settings is structurally invisible to anyone but Head Admin (not just
 * access-controlled), and Leads is hidden from a Team Member unless at
 * least one Lead is actually assigned to them — computed by the caller
 * (a Team Member with zero assignments has nothing to do there today).
 */
export function getVisibleNav(role: UserRole, opts: { hasAssignedLeads: boolean }): CmsNavEntry[] {
  const entries: CmsNavEntry[] = [DASHBOARD, CONTENT, STUDIO];

  if (role !== 'teamMember' || opts.hasAssignedLeads) {
    entries.push(LEADS);
  }

  entries.push(LIBRARY);

  if (role === 'headAdmin') {
    entries.push(SETTINGS);
  }

  return entries;
}

/** Every leaf, regardless of role — used to resolve breadcrumbs/titles for the current route. */
const ALL_ENTRIES: CmsNavEntry[] = [DASHBOARD, CONTENT, STUDIO, LEADS, LIBRARY, SETTINGS];

export interface ResolvedNavLocation {
  group?: string;
  leaf: CmsNavLeaf;
}

/** Finds the group + leaf a given CMS pathname belongs to, for breadcrumbs and the page title. */
export function resolveNavLocation(pathname: string): ResolvedNavLocation | undefined {
  for (const entry of ALL_ENTRIES) {
    if (entry.kind === 'leaf') {
      if (pathname === entry.href || pathname.startsWith(`${entry.href}/`)) {
        return { leaf: entry };
      }
    } else {
      for (const item of entry.items) {
        if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
          return { group: entry.label, leaf: item };
        }
      }
    }
  }
  return undefined;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * CMS_PRODUCT_DESIGN.md §2 breadcrumb shape (`Group > Collection > Entry >
 * Document role`), truncated to however deep the current view actually is
 * — Phase 2 has no entry/document detail views yet, so this only ever
 * resolves to `Group > Collection` or a bare top-level destination.
 */
export function getBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const location = resolveNavLocation(pathname);
  if (!location) {
    return [];
  }
  const items: BreadcrumbItem[] = [];
  if (location.group) {
    items.push({ label: location.group });
  }
  items.push({ label: location.leaf.label, href: location.leaf.href });
  return items;
}

/** Flattens a (role-filtered) nav tree into its leaves — the command palette's "Go to" quick actions. */
export function flattenNav(nav: CmsNavEntry[]): CmsNavLeaf[] {
  return nav.flatMap((entry) => (entry.kind === 'leaf' ? [entry] : entry.items));
}
