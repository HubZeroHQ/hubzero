import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { EntryTable } from './EntryTable';

describe('EntryTable', () => {
  it('renders one keyboard action per row with scoped column headers', () => {
    const markup = renderToStaticMarkup(
      <EntryTable
        entries={[{ id: '1', title: 'Alpha', status: 'draft' }]}
        columns={[
          { key: 'title', header: 'Title', render: (entry) => entry.title },
          { key: 'status', header: 'Status', render: (entry) => entry.status },
        ]}
        getRowHref={(entry) => `/studio/content/work/${entry.id}`}
        getRowKey={(entry) => entry.id}
      />,
    );

    expect(markup.match(/<a /g)).toHaveLength(1);
    expect(markup).toContain('href="/studio/content/work/1"');
    expect(markup.match(/scope="col"/g)).toHaveLength(2);
    expect(markup).toContain('role="region"');
    expect(markup).toContain('aria-label="Entries table"');
    expect(markup).toContain('tabindex="0"');
  });
});
