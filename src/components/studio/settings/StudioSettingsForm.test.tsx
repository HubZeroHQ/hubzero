import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { EntryActionState } from '@/lib/studio/entry-actions';
import { StudioSettingsForm } from './StudioSettingsForm';

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
