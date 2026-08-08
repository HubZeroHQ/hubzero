import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DASHBOARD_CONTENT_COLLECTIONS } from '@/lib/studio/dashboard-queries';
import { PublishingSummary } from './PublishingSummary';

describe('PublishingSummary', () => {
  it('links each publishing summary to the collection it describes', () => {
    const markup = renderToStaticMarkup(<PublishingSummary entries={[]} />);

    for (const collection of Object.values(DASHBOARD_CONTENT_COLLECTIONS)) {
      expect(markup).toContain(`href="${collection.href}"`);
      expect(markup).toContain(`>${collection.label}<`);
    }

    expect(markup.match(/<a /g)).toHaveLength(Object.keys(DASHBOARD_CONTENT_COLLECTIONS).length);
  });
});
