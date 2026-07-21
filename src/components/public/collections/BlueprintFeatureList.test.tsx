import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BlueprintFeatureList } from './BlueprintFeatureList';

// This project renders component tests through `renderToStaticMarkup` under
// a `node` environment (see vitest.config.ts) rather than jsdom, so click
// interaction isn't simulated here — the collapsed/expanded toggle itself
// was verified manually in a browser. What these tests guard is the part
// that matters most for "no information removed": every feature must always
// be present in the rendered markup, on both the collapsed and long-list
// paths, regardless of the mobile-only visual clipping applied via CSS.
const manyFeatures = Array.from({ length: 30 }, (_, index) => `Feature ${index + 1}`);
const fewFeatures = ['Feature 1', 'Feature 2', 'Feature 3'];

describe('BlueprintFeatureList', () => {
  it('renders every feature in the markup, even beyond the mobile-visible count', () => {
    const markup = renderToStaticMarkup(
      createElement(BlueprintFeatureList, { features: manyFeatures }),
    );

    for (const feature of manyFeatures) {
      expect(markup).toContain(feature);
    }
  });

  it('marks only the overflow items (beyond the visible count) for mobile clipping', () => {
    const markup = renderToStaticMarkup(
      createElement(BlueprintFeatureList, { features: manyFeatures }),
    );

    expect(markup.match(/blueprint-feature-overflow/g)).toHaveLength(manyFeatures.length - 6);
  });

  it('defaults to the collapsed state, unexpanded, on first render', () => {
    const markup = renderToStaticMarkup(
      createElement(BlueprintFeatureList, { features: manyFeatures }),
    );

    expect(markup).toContain('data-state="collapsed"');
    expect(markup).toContain('aria-expanded="false"');
  });

  it('shows a "Show all N capabilities" control when there are more than 6 features', () => {
    const markup = renderToStaticMarkup(
      createElement(BlueprintFeatureList, { features: manyFeatures }),
    );

    expect(markup).toContain('Show all 30 capabilities');
    expect(markup).toContain('aria-controls');
  });

  it('renders no toggle control at all when the list already fits within the mobile-visible count', () => {
    const markup = renderToStaticMarkup(
      createElement(BlueprintFeatureList, { features: fewFeatures }),
    );

    expect(markup).not.toContain('blueprint-features-toggle');
    expect(markup).not.toContain('blueprint-feature-overflow');
    for (const feature of fewFeatures) {
      expect(markup).toContain(feature);
    }
  });
});
