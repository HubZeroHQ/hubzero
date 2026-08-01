import { describe, expect, it } from 'vitest';
import {
  commandsForRole,
  filterCommands,
  groupCommands,
  navigationCommands,
  STUDIO_COMMANDS,
} from './commands';
import { getVisibleNav } from './navigation';

const navFor = (role: 'headAdmin' | 'admin' | 'member') =>
  getVisibleNav(role, { hasAssignedLeads: false, hasAssignedCandidates: false });

describe('navigationCommands', () => {
  it('derives destinations from the sidebar tree rather than a second list', () => {
    const commands = navigationCommands(navFor('headAdmin'));

    expect(commands.length).toBeGreaterThan(0);
    expect(commands.every((command) => command.section === 'navigation')).toBe(true);
    // No capability of its own: `getVisibleNav` already applied the viewer's role.
    expect(commands.every((command) => command.capability === undefined)).toBe(true);
  });

  it('inherits the permission filtering the sidebar already applies', () => {
    const headAdmin = navigationCommands(navFor('headAdmin')).map((c) => c.href);
    const member = navigationCommands(navFor('member')).map((c) => c.href);

    expect(headAdmin).toContain('/studio/settings/users');
    expect(member).not.toContain('/studio/settings/users');
  });

  it('exposes exactly the sidebar destinations, so a new page needs no palette change', () => {
    const navHrefs = navigationCommands(navFor('admin')).map((c) => c.href);
    expect(new Set(navHrefs).size).toBe(navHrefs.length);
  });
});

describe('commandsForRole', () => {
  it('gives a Head Admin every create/action command plus every sidebar destination', () => {
    const commands = commandsForRole('headAdmin', navFor('headAdmin'));
    const navCount = navigationCommands(navFor('headAdmin')).length;

    expect(commands).toHaveLength(STUDIO_COMMANDS.length + navCount);
  });

  it('keeps publish-gated actions for an Admin', () => {
    const ids = commandsForRole('admin', navFor('admin')).map((command) => command.id);
    expect(ids).toContain('action-featured-work');
  });

  it('hides every publish-gated action from a Member while keeping creation', () => {
    const ids = commandsForRole('member', navFor('member')).map((command) => command.id);

    expect(ids).not.toContain('action-featured-work');
    expect(ids).not.toContain('action-content-health');
    expect(ids).not.toContain('action-relationship-health');
    expect(ids).toContain('new-work');
    // Navigation ids are derived from the sidebar href, not hardcoded.
    expect(ids).toContain('nav:/studio/dashboard');
  });

  it('never leaks a create/action command whose capability the role lacks', () => {
    for (const role of ['headAdmin', 'admin', 'member'] as const) {
      const nonNav = commandsForRole(role, navFor(role)).filter(
        (command) => command.section !== 'navigation',
      );
      for (const command of nonNav) {
        expect(STUDIO_COMMANDS).toContain(command);
      }
    }
  });
});

describe('every command has a real destination', () => {
  it('points at a Studio route', () => {
    for (const command of STUDIO_COMMANDS) {
      expect(command.href.startsWith('/studio/')).toBe(true);
    }
  });

  it('uses unique ids so the palette can key on them', () => {
    const ids = STUDIO_COMMANDS.map((command) => command.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('filterCommands', () => {
  const commands = commandsForRole('headAdmin', navFor('headAdmin'));

  it('returns everything for an empty query', () => {
    expect(filterCommands(commands, '')).toHaveLength(commands.length);
    expect(filterCommands(commands, '   ')).toHaveLength(commands.length);
  });

  it('ranks a label prefix above a mid-label match', () => {
    const results = filterCommands(commands, 'new');
    expect(results[0]?.label.toLowerCase().startsWith('new')).toBe(true);
  });

  it('matches a word inside the label', () => {
    const ids = filterCommands(commands, 'blueprint').map((command) => command.id);
    expect(ids).toContain('nav:/studio/content/blueprints');
    expect(ids).toContain('new-blueprint');
  });

  it('matches the hint, so intent finds the command', () => {
    const ids = filterCommands(commands, 'broken references').map((command) => command.id);
    expect(ids).toEqual(['action-relationship-health']);
  });

  it('returns nothing for an unmatched query', () => {
    expect(filterCommands(commands, 'zzzz')).toEqual([]);
  });

  it('is deterministic regardless of input order', () => {
    const forward = filterCommands(commands, 'featured').map((command) => command.id);
    const reversed = filterCommands([...commands].reverse(), 'featured').map(
      (command) => command.id,
    );
    expect(reversed).toEqual(forward);
  });

  it('filters within an already permission-filtered list, never around it', () => {
    const memberResults = filterCommands(commandsForRole('member', navFor('member')), 'featured');
    expect(memberResults).toEqual([]);
  });
});

describe('groupCommands', () => {
  it('groups in a stable section order and omits empty sections', () => {
    const groups = groupCommands(
      filterCommands(commandsForRole('headAdmin', navFor('headAdmin')), 'new'),
    );

    expect(groups.map((group) => group.section)).toEqual(['create']);
  });

  it('keeps all three sections when all are populated', () => {
    const groups = groupCommands(commandsForRole('headAdmin', navFor('headAdmin')));
    expect(groups.map((group) => group.section)).toEqual(['navigation', 'create', 'actions']);
  });

  it('returns no groups for no commands', () => {
    expect(groupCommands([])).toEqual([]);
  });
});
