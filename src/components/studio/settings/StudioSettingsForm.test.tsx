import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { EntryActionState } from '@/lib/studio/entry-actions';
import { StudioSettingsForm } from './StudioSettingsForm';

/**
 * `EditorForm` asks the App Router to re-read server state after a save, so
 * every Studio form now transitively depends on a mounted router that
 * `renderToStaticMarkup` doesn't provide. Only `refresh` is reachable from a
 * render pass, so the stub covers exactly that.
 */
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: () => {}, push: () => {}, replace: () => {}, back: () => {} }),
}));

async function action(): Promise<EntryActionState> {
  return {};
}

describe('StudioSettingsForm', () => {
  it('exposes only the operational Studio identity fields', () => {
    const markup = renderToStaticMarkup(
      <StudioSettingsForm
        action={action}
        initialValues={{ studioName: 'HubZero', contactEmail: 'hello@hubzero.in' }}
      />,
    );

    expect(markup).toContain('Studio name');
    expect(markup).toContain('Contact email');
    expect(markup).not.toContain('Tagline');
    expect(markup).not.toContain('Accent color');
    expect(markup).not.toContain('name="tagline"');
    expect(markup).not.toContain('name="accentColor"');
  });
});
