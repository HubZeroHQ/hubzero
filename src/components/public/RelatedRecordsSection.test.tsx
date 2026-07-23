import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PublicRelationship } from '@/lib/public/domain';
import { RelatedRecordsSection } from './RelatedRecordsSection';

function relationship(title: string): PublicRelationship {
  return {
    kind: 'buildAppliedInWork',
    label: 'Informed by',
    target: { type: 'build', title, url: `/builds/${title}` },
  };
}

describe('RelatedRecordsSection', () => {
  it('renders a flat list, with no sub-heading, for a single untitled group', () => {
    const markup = renderToStaticMarkup(
      <RelatedRecordsSection
        id="relations-product-lineage"
        title="Product lineage"
        groups={[{ relationships: [relationship('QueryCraft')] }]}
        sectionClassName="detail-relations"
        containerClassName="detail-relations-grid"
      />,
    );

    expect(markup).toContain('class="home-relationships" aria-label="Product lineage"');
    expect(markup).not.toContain('detail-relation-groups');
    expect(markup).not.toContain('<h3>');
  });

  it('renders titled sub-groups for multiple groups', () => {
    const markup = renderToStaticMarkup(
      <RelatedRecordsSection
        id="grouped-connections-title"
        title="Continue through the engineering record"
        groups={[
          { title: 'Related Work', relationships: [relationship('Bhatkal Time Luxe')] },
          { title: 'Related Builds', relationships: [relationship('QueryCraft')] },
        ]}
        sectionClassName="detail-relations"
        containerClassName="detail-relations-grid"
      />,
    );

    expect(markup).toContain('class="detail-relation-groups"');
    expect(markup).toContain('<h3>Related Work</h3>');
    expect(markup).toContain('<h3>Related Builds</h3>');
  });

  it('renders nothing when there are no groups', () => {
    const markup = renderToStaticMarkup(
      <RelatedRecordsSection
        id="relations-empty"
        title="Nothing to show"
        groups={[]}
        sectionClassName="detail-relations"
        containerClassName="detail-relations-grid"
      />,
    );

    expect(markup).toBe('');
  });

  it('renders supplied header content (e.g. an evidence graph) after the description', () => {
    const markup = renderToStaticMarkup(
      <RelatedRecordsSection
        id="profile-evidence-title"
        title="Follow the contribution into the work."
        description="Every connection below is explicit in the public record."
        headerContent={<p className="profile-evidence-graph-meta">2 connections</p>}
        groups={[{ title: 'Related Work', relationships: [relationship('Bhatkal Time Luxe')] }]}
        sectionClassName="profile-evidence profile-chapter"
        containerClassName="profile-evidence-grid"
      />,
    );

    expect(markup).toContain('Every connection below is explicit in the public record.');
    expect(markup).toContain('class="profile-evidence-graph-meta">2 connections</p>');
  });

  it('uses the caller-supplied section and container class names, not a hardcoded default', () => {
    const markup = renderToStaticMarkup(
      <RelatedRecordsSection
        id="note-relations-title"
        title="Continue through the record"
        groups={[{ title: 'Related Work', relationships: [relationship('Bhatkal Time Luxe')] }]}
        sectionClassName="note-relations"
        containerClassName="note-relations-grid"
      />,
    );

    expect(markup).toContain('class="public-section note-relations"');
    expect(markup).toContain('class="public-container note-relations-grid"');
    expect(markup).not.toContain('detail-relations');
  });
});
