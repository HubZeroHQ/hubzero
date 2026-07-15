import {
  Blocks,
  Box,
  Briefcase,
  FlaskConical,
  Handshake,
  Image as ImageIcon,
  Inbox,
  NotebookPen,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { SearchEntityType } from './types';

/** Mirrors the icon each type already uses in the sidebar (`lib/studio/navigation.ts`) — one icon per entity type, never per-instance. */
export const SEARCH_TYPE_META: Record<SearchEntityType, { label: string; icon: LucideIcon }> = {
  work: { label: 'Work', icon: Briefcase },
  builds: { label: 'Builds', icon: Box },
  blueprints: { label: 'Blueprints', icon: Blocks },
  labs: { label: 'Labs', icon: FlaskConical },
  notes: { label: 'Notes', icon: NotebookPen },
  team: { label: 'Team', icon: Users },
  services: { label: 'Services', icon: Handshake },
  leads: { label: 'Leads', icon: Inbox },
  users: { label: 'Users', icon: UserCog },
  media: { label: 'Media', icon: ImageIcon },
};
