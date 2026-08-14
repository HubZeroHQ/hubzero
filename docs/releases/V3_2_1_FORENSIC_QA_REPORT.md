# v3.2.1 forensic QA and reliability investigation

**Investigation date:** 14 August 2026 (IST)
**Repository:** `HubZeroHQ/hubzero`
**Release under test:** `v3.2.0` (`7a97aaf20becd0b8d953bc5a60666f59e66eee12`)
**Actual worktree under test:** clean `dev` / `origin/dev` at `6ae86f5a6ef9f9d9ee8fbdca4c84c878759050fd`
**Next release:** `v3.2.1`
**Mode:** investigation only; no production or application behavior was changed

## 1. Executive summary

The current worktree is healthy at the conventional validation layer: lint, TypeScript, all 757 tests, and two production builds passed. A crawl of 77 local-production internal links and 90 live-production internal links found no broken destinations. The live image audit found 256 rendered image occurrences, all with `alt`, `width`, and `height`; all 75 unique image URLs responded successfully. Canonical, description, Open Graph, Twitter, and JSON-LD checks were also clean across the 36 live sitemap routes, apart from the specific title and 404 defects below.

The investigation confirmed seven release-relevant defects. Four are high severity:

1. The global unmatched-route 404 is incompatible with the multiple-root-layout architecture. In development it returns 500 and can leave subsequently requested routes returning the same error until restart. In production it returns 404 but without any stylesheet and with incorrect 404 metadata.
2. Missing records under all seven public dynamic-detail route families return HTTP 200. With JavaScript disabled, the response contains navigation and footer but no `<main>`, `<h1>`, or not-found message.
3. The public route-group loading boundary returns `null`, removing the complete page body while the persistent footer remains in flow. This is a concrete navigation layout-shift source and matches the reported footer jump; it is not yet quantitatively attributable to all of the field CLS.
4. Vercel Speed Insights was added after the `v3.2.0` tag, while `/privacy` still categorically says that the site does not use analytics or share visitor data with an analytics service.

Three medium findings complete the confirmed inventory: the title template contains mojibake on essentially every titled public route, the global search-dialog combobox has no accessible name, and all five Engineering Profiles skip from `<h2>` to `<h4>` in two repeated sections.

No Critical finding was discovered. No evidence justified reopening M32-M65, changing MongoDB, changing cache semantics, changing regions, or performing a dependency-force upgrade.

## 2. Baseline and scope

### Repository state

- `v3.2.0` resolves to the expected release commit `7a97aaf`.
- The checked-out branch is clean `dev`, tracking `origin/dev`, at `6ae86f5`.
- The tested worktree is **not exactly the release tag**. It is two commits ahead:
  - `1788727 feat: integrate SpeedInsights for performance analysis in PublicLayout`
  - `6ae86f5 feat: add hubzero logo SVG file`
- `package.json` remains version `3.2.0`. That is a normal pre-release state, not a bug.
- The tag-to-HEAD diff contains the Speed Insights integration and a new black logo asset. `git diff --check 7a97aaf..HEAD` passed.

### Validation baseline

| Check | Result |
| --- | --- |
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| `npm test` | Pass: 107 files, 757 tests |
| `npm run build` | Pass twice; 46 generated routes |
| `npm audit --audit-level=low` | Five moderate PostCSS-chain advisories; no high/critical finding; only full remediation is a breaking forced Next.js 16 upgrade |
| `npm run format:check` | Environmental failure: 636 files because the clean Windows checkout uses CRLF while repository blobs use LF |

### Route inventory and runtime coverage

- Route source inventory: 85 page files — 21 public and 64 Studio.
- Local production sitemap: 31 public URLs.
- Live production sitemap: 36 public URLs.
- The five live-only URLs were additional published Blueprints, not dead routes.
- Every public route family, every published dynamic route in the sitemap, root and dynamic missing routes, query filters, trailing slashes, malformed URLs, public APIs, preview validation, unauthenticated Studio pages, and unauthenticated Studio APIs were checked over HTTP.
- Authenticated Studio interaction, browser back/forward, focus trapping, and viewport screenshots could not be completed because the connected browser rejected both localhost and production under an administrator-enforced security-policy verification failure. No alternate browser automation stack was used to bypass that control.

## 3. Findings

## A. Confirmed bugs

### HZ321-F01 — Global 404 is outside every root layout

- **Severity:** High
- **Category:** Routing / error handling / production consistency / metadata
- **Affected route/component/file:** unmatched root URLs such as `/doesnotexist`; [`src/app/not-found.tsx`](../../src/app/not-found.tsx), [`src/app/(public)/layout.tsx`](<../../src/app/(public)/layout.tsx>), [`src/app/studio/layout.tsx`](../../src/app/studio/layout.tsx), [`src/app/root-document.tsx`](../../src/app/root-document.tsx)
- **Exact observed behavior:**
  - Fresh development server: `/doesnotexist` returns 500 with `not-found.tsx doesn't have a root layout.`
  - After that request, ordinary routes and metadata routes such as `/work`, `/studio/login`, and `/manifest.json` can return the same 500 until the development server is restarted.
  - Local production and `https://hubzero.in/doesnotexist` return HTTP 404 and the custom HubZero copy, but the response has zero stylesheet links, no font/body classes, and appears as default HTML.
  - The live canonical is `https://hubzero.in/_not-found`, the title is only `Page not found`, and two robots directives are emitted: `noindex` and `noindex, follow`.
- **Expected behavior:** An unmatched URL should return an independently styled, accessible HubZero 404 document with correct public metadata. Compiling it must not make unrelated development routes fail.
- **Reproduction steps:** Start `next dev`, request `/doesnotexist`, then request `/work` or `/manifest.json`. Separately start `next start` and request `/doesnotexist`; inspect status, stylesheet links, classes, title, canonical, and robots tags. Repeat against production.
- **Evidence:** The `v3.2.0` commit deleted `src/app/layout.tsx` and made `(public)/layout.tsx` and `studio/layout.tsx` independent root layouts, but the root-level `not-found.tsx` remained outside either subtree. The build client-reference manifest reports no CSS entry for `src/app/not-found`. Local and live HTTP output are identical on the production symptoms. [Next.js documents `global-not-found.tsx`](https://nextjs.org/docs/app/api-reference/file-conventions/not-found) specifically for applications with multiple root layouts.
- **Likely root cause:** `app/not-found.tsx` needs a parent root layout, but HubZero deliberately has no top-level `app/layout.tsx`. The production build can emit the special page, but it is not composed through `RootDocument` or the public root's CSS/metadata.
- **Confidence:** Very high
- **Covered by known v3.2.1 issues:** Yes — known issues 3 and 4. The metadata leak, duplicate robots directives, and development-server contamination broaden the known scope.
- **Recommended fix direction:** Preserve the independent public/Studio roots and Studio readiness gate. Prefer Next.js's multiple-root-compatible `global-not-found.tsx` path, returning a complete `<html>/<body>` document and explicitly importing the required styles/fonts, after validating it against the installed Next 15.5 line. Keep the nested public `not-found.tsx` for `notFound()` inside public route segments. Do not restore a common root without proving that Studio's pre-stream readiness guarantee survives.
- **Regression test appropriate:** Yes. Add development and production integration checks for status, styles, title/canonical, one main landmark, and a subsequent healthy request after a missing URL.

### HZ321-F02 — Every missing public detail record is a streamed HTTP 200 soft 404

- **Severity:** High
- **Category:** Routing / SEO / progressive enhancement / error semantics
- **Affected route/component/file:** `/work/[slug]`, `/builds/[slug]`, `/blueprints/[slug]`, `/labs/[slug]`, `/notes/[slug]`, `/engineering/[slug]`, `/careers/[slug]`; the seven corresponding `page.tsx` files under [`src/app/(public)`](<../../src/app/(public)>)
- **Exact observed behavior:** All fourteen checks (seven route families against local production and live production) returned HTTP 200 for `does-not-exist`. Hydrated clients receive the custom not-found UI, but the server HTML outside RSC scripts contains the nav/footer only: no `<main>`, no `<h1>`, and no missing-record message. Each response canonicalizes the nonexistent URL and emits both `noindex, follow` and framework-added `noindex` tags.
- **Expected behavior:** A missing public record should return HTTP 404 and include the not-found content in the server-readable document, with one unambiguous noindex policy and no canonical claiming that the absent record is a valid page.
- **Reproduction steps:** Request each of the following with redirects disabled and inspect the status and HTML with scripts removed: `/work/does-not-exist`, `/builds/does-not-exist`, `/blueprints/does-not-exist`, `/labs/does-not-exist`, `/notes/does-not-exist`, `/engineering/does-not-exist`, `/careers/does-not-exist`.
- **Evidence:** Every detail page fetches its entity in the page and then calls `notFound()` when absent. Its separate `generateMetadata` path returns custom “not found” metadata rather than terminating. [Next.js documents](https://nextjs.org/docs/app/api-reference/file-conventions/not-found) that `notFound()` returns 200 after a response has begun streaming and 404 only for non-streamed responses. The shell is present before the entity read resolves, which is consistent with the observed HTML and status.
- **Likely root cause:** Missing-state detection occurs after the public root has begun streaming. Returning normal metadata for the absent record permits the route shell/head to commit before the page throws `notFound()`.
- **Confidence:** Very high
- **Covered by known v3.2.1 issues:** No. The known issue covers unmatched root URLs, not missing records inside valid dynamic route families.
- **Recommended fix direction:** Establish missing existence before the response commits, or otherwise adopt a route design that produces a non-streamed 404 while retaining ISR, preview authorization, and current cache semantics. Evaluate whether `notFound()` in the metadata/existence path is sufficient in the installed framework version; do not assume it. Remove the absent URL's canonical and avoid manually duplicating framework noindex output.
- **Regression test appropriate:** Yes. One parameterized HTTP integration test should cover all seven families, assert 404, assert server-readable status content, and assert canonical/robots behavior.

### HZ321-F03 — Null public loading boundary removes page geometry and exposes the footer

- **Severity:** High
- **Category:** Loading state / UX / Core Web Vitals / CLS
- **Affected route/component/file:** all public client-side navigation; [`src/app/(public)/loading.tsx`](<../../src/app/(public)/loading.tsx>), [`src/components/public/PublicShell.tsx`](../../src/components/public/PublicShell.tsx), `.public-shell` in [`src/app/globals.css`](../../src/app/globals.css)
- **Exact observed behavior:** The reported navigation behavior — page content disappears and the footer jumps toward the top — is directly explained by the rendered structure. The route loading fallback returns `null`; `PublicShell` renders `{children}` immediately before the footer; and `.public-shell` has only `min-height: 100svh`, not a layout rule that reserves the outgoing main's height or anchors the footer.
- **Expected behavior:** Navigation should retain meaningful page geometry through an appropriate route skeleton. Foundation-page identity/hero content should appear immediately where possible, while genuinely dynamic counts use localized reserved skeletons.
- **Reproduction steps:** On a browser session, navigate client-side between uncached public pages under a throttled network and record layout-shift entries. Source reproduction is immediate: replace the route page with its `loading.tsx` output and observe that the footer becomes the only normal-flow content beneath fixed navigation.
- **Evidence:** `loading.tsx` is six lines and returns `null`. There are no other public route skeleton components. The only other public loading UI is the search dialog's inline status. Major images already reserve dimensions, making the route-body removal a materially stronger structural shift source than image decoding.
- **Likely root cause:** The global route-group Suspense boundary is too visually empty and too broad. It swaps the entire route body to zero height while layout chrome remains.
- **Confidence:** Very high for the navigation shift mechanism; medium for how much of the supplied production field CLS it explains because field traces were not available.
- **Covered by known v3.2.1 issues:** Yes — known issue 1 and the known CLS concern. This investigation identifies a concrete source rather than attributing every CLS sample to it.
- **Recommended fix direction:** Add route-category skeletons with stable geometry, keep foundation headings/hero identity outside avoidable asynchronous work, and localize count/stat skeletons. Verify with actual `layout-shift` attribution before making any further CLS change. Do not globally eager-load images or alter cache behavior.
- **Regression test appropriate:** Yes. Add component snapshots for nonempty loading landmarks and a browser test that throttles a client navigation and asserts the footer does not move into the former main-content region. Keep a measured CLS budget as a separate browser check.

### HZ321-F04 — The public title template contains literal mojibake

- **Severity:** Medium
- **Category:** Metadata / encoding
- **Affected route/component/file:** every titled public page; [`src/app/(public)/layout.tsx`](<../../src/app/(public)/layout.tsx>)
- **Exact observed behavior:** Live titles render `Work â€” HubZero`, `Labs â€” HubZero`, and the same corruption on 35 of the 36 sitemap routes (home uses the default title and is unaffected). Search and missing-detail titles are affected too. Open Graph and Twitter titles use the correct em dash because they are assembled in a different helper.
- **Expected behavior:** `Work — HubZero`, `Labs — HubZero`, and equivalent titles using U+2014 EM DASH.
- **Reproduction steps:** Request any non-home public page and inspect `<title>`. In source, read the title-template string as UTF-8 and inspect its code points.
- **Evidence:** The raw source contains U+00E2 U+20AC U+201D in the template, not U+2014. A UTF-8 source scan found only this user-facing occurrence; the widespread mojibake shown by Windows PowerShell for other UTF-8 source strings was a console-decoding artifact and was ruled out.
- **Likely root cause:** A correctly encoded em dash was decoded and saved as the three-character mojibake sequence when metadata moved from the former top-level layout into the public root in commit `7a97aaf`.
- **Confidence:** Very high
- **Covered by known v3.2.1 issues:** Yes — known issue 2. The actual blast radius is nearly every public page, not only Work and Labs.
- **Recommended fix direction:** Replace only the malformed template delimiter with the intended Unicode character and ensure the editor/tooling saves UTF-8. Avoid broad encoding rewrites.
- **Regression test appropriate:** Yes. Render or resolve public metadata and assert the exact title/code point, including a representative dynamic detail.

### HZ321-F05 — Speed Insights contradicts the current privacy disclosure

- **Severity:** High
- **Category:** Production consistency / privacy / release governance
- **Affected route/component/file:** every public route and `/privacy`; [`src/app/(public)/layout.tsx`](<../../src/app/(public)/layout.tsx>), [`src/config/public-site.ts`](../../src/config/public-site.ts)
- **Exact observed behavior:** The public root mounts `<SpeedInsights />`. The installed package says it automatically tracks Web Vitals and other performance metrics. Live `/_vercel/speed-insights/script.js` returns 200 and contains Web Vital collection and beacon-transmission logic. [Vercel documents](https://vercel.com/docs/speed-insights/privacy-policy) that the browser script reports anonymous per-page data points to Vercel, including route/URL, network speed, browser, device type/OS, country, Web Vital, and attribution. `/privacy`, last updated 28 July 2026, says: “This site does not use analytics … and does not share visitor data with any third-party analytics or marketing service.”
- **Expected behavior:** Production instrumentation and the public disclosure must describe the same reality, including processor, categories of data, purpose, retention/control, cookie behavior, and any opt-out that actually exists.
- **Reproduction steps:** Inspect the public layout and privacy content, request the live Speed Insights script, and compare its stated behavior with the disclosure.
- **Evidence:** Commit `1788727` added Speed Insights on 10 August 2026 without updating the privacy content. The integration is present in the current clean worktree and the live script endpoint is active. No public `Set-Cookie` header was observed, so the specific cookie sentence was not disproved; the categorical “no analytics” and no analytics-service sharing claims are the conflict.
- **Likely root cause:** Telemetry was added after the privacy page's implementation-derived audit without the paired content/release-governance update required by that page's own source comment.
- **Confidence:** Very high
- **Covered by known v3.2.1 issues:** No.
- **Recommended fix direction:** Make an explicit product/legal choice: accurately update the disclosure after documenting the live Speed Insights data flow, or disable the integration until that disclosure is ready. Do not guess at Vercel's processing or retention terms from the package name alone.
- **Regression test appropriate:** A unit test is not sufficient by itself. Add a release-checklist/configuration assertion that enabling public analytics requires the privacy content/version to be reviewed; retain a live endpoint smoke check.

### HZ321-F06 — Search dialog combobox has no accessible name

- **Severity:** Medium
- **Category:** Accessibility / search
- **Affected route/component/file:** the global Cmd/Ctrl+K search dialog; [`src/components/public/search/PublicSearchDialog.tsx`](../../src/components/public/search/PublicSearchDialog.tsx)
- **Exact observed behavior:** The dialog's `<input role="combobox">` has a placeholder, `aria-autocomplete`, `aria-expanded`, `aria-controls`, and optionally `aria-activedescendant`, but no `<label>`, `aria-label`, or `aria-labelledby`. The WAI accessible-name implementation in `dom-accessibility-api` computes an empty name for the equivalent element.
- **Expected behavior:** The field should expose a stable descriptive name such as “Search published records”; a placeholder can remain a hint but must not be the only identification.
- **Reproduction steps:** Open the global search, inspect the combobox's accessibility tree, or run the accessible-name algorithm against its rendered attributes.
- **Evidence:** Source lines around the input contain no naming association. By contrast, the full `/search` page correctly uses `<label htmlFor="public-search-page">Search HubZero</label>`.
- **Likely root cause:** The dialog implementation treated placeholder text as a sufficient field label while correctly labelling the dialog and its icon-only buttons.
- **Confidence:** Very high
- **Covered by known v3.2.1 issues:** No.
- **Recommended fix direction:** Add a programmatic label without changing the visual composition. Keep the current dialog title and combobox/listbox wiring.
- **Regression test appropriate:** Yes. Add a focused interaction/accessibility test that opens the dialog and queries the combobox by role and accessible name.

### HZ321-F07 — Engineering Profile sections skip heading levels

- **Severity:** Medium
- **Category:** Accessibility / document semantics
- **Affected route/component/file:** all five live `/engineering/[slug]` pages; [`src/components/public/ProseRenderer.tsx`](../../src/components/public/ProseRenderer.tsx), [`src/components/public/engineering/profile-shared.tsx`](../../src/components/public/engineering/profile-shared.tsx)
- **Exact observed behavior:** Each profile has two H2-to-H4 jumps: “Questions from the work” directly to each interview question at H4, and “Changes in practice” directly to timeline item titles at H4. The 36-route live heading crawl found ten skips total and no other heading-level skips.
- **Expected behavior:** Section item headings should descend one level from their H2 section heading unless a real intervening H3 grouping exists.
- **Reproduction steps:** Inspect the heading outline on `/engineering/rifaque`, `/engineering/raif`, `/engineering/iyad`, `/engineering/sultan`, and `/engineering/salsabeel`.
- **Evidence:** Profile documents call `ProseRenderer` with `headingOffset={1}`. Authored heading blocks have that offset applied, and timeline events are unconditionally rendered as `<h4>`. Existing tests check sanitization and profile content but not outline hierarchy.
- **Likely root cause:** A generic document heading offset and a hard-coded timeline heading level are applied without awareness of the H2 section wrapper. Some authored interview heading levels also start too deep for this embedding context.
- **Confidence:** High
- **Covered by known v3.2.1 issues:** No.
- **Recommended fix direction:** Define the correct heading level at the profile document boundary and make timeline/item headings context-aware. Validate existing content rather than globally demoting every H4 in the renderer.
- **Regression test appropriate:** Yes. Render each document role under its section wrapper and assert a non-skipping heading outline.

## B. Likely bugs requiring targeted confirmation

### HZ321-L01 — Public data-read failures can masquerade as empty or missing content

- **Severity:** High
- **Category:** Error handling / reliability
- **Affected route/component/file:** public homepage and collection indexes; Blueprint, Note, Engineering Profile, and Career detail pages
- **Exact observed behavior:** Source paths catch arbitrary repository errors and return `[]`, an empty homepage projection, or `null`. On detail routes, `null` flows to `notFound()`. Therefore a transient operational read failure is capable of rendering an honest-looking empty collection or “not found” result instead of the public error/unavailable UI.
- **Expected behavior:** A true absence should remain distinct from a transient read failure. Visitors need a detail-free unavailable state; operators need the logged cause.
- **Reproduction steps:** In an isolated test environment, mock the corresponding public query to reject before and after streaming and request the route. Do not use Atlas or production fault injection.
- **Evidence:** `safeBlueprintDetail`, `safeNoteDetail`, `safeEngineeringProfile`, and `safeCareerDetail` catch all errors and return `null`; most public index pages catch and return an empty array; home uses `Promise.allSettled` and empty projections. Work, Build, and Lab detail pages instead allow errors to propagate, so the contract is inconsistent.
- **Likely root cause:** Resilience and data-absence paths were merged at page level to prevent public errors, bypassing the existing public error boundary.
- **Confidence:** High in the source path; runtime presentation still needs controlled rejection tests.
- **Covered by known v3.2.1 issues:** No, and it does not require reopening Mongo readiness or cache configuration.
- **Recommended fix direction:** First write rejection-path tests and define a consistent public failure contract. Preserve fail-closed publication and do not expose error details. Avoid a broad rewrite of query/caching layers.
- **Regression test appropriate:** Yes, using mocked query rejection only.

### HZ321-L02 — Media Picker requests can overwrite newer search results

- **Severity:** Medium
- **Category:** Studio / asynchronous state / race condition
- **Affected route/component/file:** Studio Media Picker; [`src/components/media/MediaPicker.tsx`](../../src/components/media/MediaPicker.tsx)
- **Exact observed behavior:** The effect clears only the 200 ms debounce timer. Once `searchMediaAction` starts, it is neither aborted nor guarded by a request generation. A slower request for query A can resolve after a faster request for query B and replace B's results; either request's `finally` can also clear the loading state while another request is pending.
- **Expected behavior:** Only the latest query/folder request should update results and loading state.
- **Reproduction steps:** In a component test, defer query A, start query B, resolve B first, then resolve A. Observe which result set remains.
- **Evidence:** The promise chain calls `.then(setResults)` and `.finally(() => setLoading(false))` without checking whether its query/folder is still current. No Media Picker regression test covers ordering.
- **Likely root cause:** Debounce cleanup was mistaken for in-flight cancellation.
- **Confidence:** High; authenticated UI reproduction was blocked.
- **Covered by known v3.2.1 issues:** No.
- **Recommended fix direction:** Use a monotonically increasing request token or cancellable request contract and update state only for the latest request. Do not change media repository behavior.
- **Regression test appropriate:** Yes; a two-deferred-promise test is sufficient.

### HZ321-L03 — Command palette treats HTTP failures as a successful empty content index

- **Severity:** Medium
- **Category:** Studio / API error contract / authentication edge case
- **Affected route/component/file:** Studio command palette; [`src/components/studio/command-palette/CommandPalette.tsx`](../../src/components/studio/command-palette/CommandPalette.tsx), `/api/studio/search`
- **Exact observed behavior:** The palette parses every response as JSON without checking `response.ok`. A 401 response after session expiry is `{ error: "Unauthorized" }`; it becomes `data.results ?? []`, leaves `loadFailed` false, and silently removes all content results for the rest of the mounted session.
- **Expected behavior:** Non-2xx responses should enter the existing degraded/error state, with an authentication-specific route where appropriate.
- **Reproduction steps:** Open Studio with a valid session, expire/invalidate it before the palette's first index fetch, then open the palette. Alternatively mock fetch with the real 401 JSON body.
- **Evidence:** The unauthenticated endpoint correctly returned HTTP 401 during this investigation. The client chain has `.then(response => response.json())` but no status guard; only network/parse rejection reaches `.catch`.
- **Likely root cause:** The client assumes successful JSON implies a successful HTTP operation.
- **Confidence:** High in the code path; the session-expiry interaction was not executed.
- **Covered by known v3.2.1 issues:** No.
- **Recommended fix direction:** Reject non-OK responses before parsing results and decide explicitly whether 401 should prompt reauthentication or use the existing degraded message.
- **Regression test appropriate:** Yes; mock 401, 503, malformed JSON, and 200 separately in one focused test group.

## C. Technical debt and risks

### HZ321-R01 — Formatting validation is not portable to this clean Windows checkout

- **Severity:** Low
- **Category:** Developer reliability / line endings
- **Affected route/component/file:** repository-wide; no `.gitattributes`; `.prettierrc.json`
- **Exact observed behavior:** `npm run format:check` reports 636 files in a clean worktree. `git ls-files --eol` shows `i/lf w/crlf` for representative files, and global Git configuration has `core.autocrlf=true`.
- **Expected behavior:** A documented clean checkout should pass the repository's formatting validation on supported development platforms.
- **Reproduction steps:** Clean checkout on Windows with `core.autocrlf=true`, then run `npm run format:check`.
- **Evidence:** Git status stayed clean and repository blobs are LF; the failure is checkout normalization, not 636 independent formatting regressions.
- **Likely root cause:** No repository EOL policy is present, while Prettier expects LF.
- **Confidence:** Very high
- **Covered by known v3.2.1 issues:** No.
- **Recommended fix direction:** Handle as a tooling follow-up with an explicit `.gitattributes`/supported-platform policy and a deliberate one-time normalization plan. Do not mass-rewrite it into v3.2.1 incident fixes.
- **Regression test appropriate:** CI already provides the appropriate check once checkout policy is explicit.

### HZ321-R02 — Vitest configuration uses a future-unsupported Vite loading path

- **Severity:** Low
- **Category:** Test tooling
- **Affected route/component/file:** `vitest.config.ts`, package module configuration
- **Exact observed behavior:** The passing test run warns that ESM syntax in `vitest.config.ts` is being loaded as CommonJS and will not be supported by Vite's future native config loader.
- **Expected behavior:** Test configuration should load without a future-removal warning.
- **Reproduction steps:** Run `npm test`.
- **Evidence:** Warning emitted before the 107-file/757-test passing run.
- **Likely root cause:** `.ts` config/module-mode mismatch in a package without the corresponding module declaration.
- **Confidence:** Very high
- **Covered by known v3.2.1 issues:** No.
- **Recommended fix direction:** Defer to a tooling release; choose the smallest config extension/module adjustment after validating Next scripts.
- **Regression test appropriate:** Existing test invocation is sufficient.

### HZ321-R03 — Five moderate PostCSS-chain advisories remain without a nonbreaking full remediation

- **Severity:** Low
- **Category:** Dependency risk
- **Affected route/component/file:** dependency tree reported by npm audit
- **Exact observed behavior:** `npm audit --audit-level=low` reports five moderate advisories. Npm's only full automatic remediation requires `--force` and proposes Next.js 16.3.0.
- **Expected behavior:** Track and update when a compatible supported resolution is available.
- **Reproduction steps:** Run `npm audit --audit-level=low`.
- **Evidence:** No high or critical advisory was reported. No fix command was run.
- **Likely root cause:** Transitive PostCSS tooling versions in the current Next/Tailwind chain.
- **Confidence:** Very high
- **Covered by known v3.2.1 issues:** Already documented risk, not a newly discovered application regression.
- **Recommended fix direction:** Do not use `npm audit fix --force` for v3.2.1. Address through a tested framework/toolchain upgrade.
- **Regression test appropriate:** Dependency scanning is sufficient.

### HZ321-R04 — Blueprint capability disclosure depends on hydration on mobile

- **Severity:** Low
- **Category:** Progressive enhancement / responsive accessibility
- **Affected route/component/file:** Blueprint detail capability lists; [`src/components/public/collections/BlueprintFeatureList.tsx`](../../src/components/public/collections/BlueprintFeatureList.tsx), mobile rules in [`src/app/globals.css`](../../src/app/globals.css)
- **Exact observed behavior:** Server output uses `data-state="collapsed"`. At widths below 768 px, CSS hides every capability after item six and shows the expansion button. Without JavaScript/hydration, the button cannot change state, so the remaining rendered content is visually unreachable. Before hydration, hidden items also lack `aria-hidden`; it is added only after `matchMedia` runs.
- **Expected behavior:** A no-JS public document should not present an inoperative disclosure that conceals content, and visual/accessibility state should agree at first paint.
- **Reproduction steps:** Load a Blueprint with more than six capabilities at mobile width with JavaScript disabled.
- **Evidence:** The existing static tests explicitly do not simulate clicking and only prove that all values remain in the markup.
- **Likely root cause:** CSS owns initial collapse while React owns both expansion and accessible hidden state.
- **Confidence:** High from source; connected-browser confirmation was unavailable.
- **Covered by known v3.2.1 issues:** No.
- **Recommended fix direction:** Confirm browser/no-JS product requirements before changing. A progressive-enhancement approach should default to expanded without a hydration marker, then enable collapse/toggle once interactive.
- **Regression test appropriate:** Yes if promoted to a bug; cover pre-hydration and post-hydration mobile states.

## D. False positives and investigated areas ruled out

### HZ321-D01 — Images are not presently evidenced as the primary CLS source

- **Severity:** Low
- **Category:** Image/media / performance
- **Affected route/component/file:** all live sitemap pages and `PublicImage`
- **Exact observed behavior:** 256 live image occurrences all carry `alt`, `width`, and `height`; every one of 75 unique URLs returned 200/206. Below-fold content uses Next's lazy default, while first/hero images are selectively marked priority. Card/row CSS also reserves aspect ratios.
- **Expected behavior:** Intrinsic dimensions and deliberate eager/lazy choices; observed.
- **Reproduction steps:** Crawl live HTML and image URLs; inspect `PublicImage` call sites and CSS.
- **Evidence:** Zero missing attributes and zero broken unique URLs. The first Blueprint index content image is eager and 14 subsequent content images are lazy. Detail heroes are priority while galleries/prose images are lazy.
- **Likely root cause:** Not applicable; the hypothesis was not supported.
- **Confidence:** High for static reservation and reachability; decoding-time visual behavior still needs a browser trace.
- **Covered by known v3.2.1 issues:** It narrows known image/CLS work.
- **Recommended fix direction:** Do not add `loading="lazy"` indiscriminately and do not demote true LCP heroes. Continue route-specific verification only.
- **Regression test appropriate:** Existing component tests plus an image-attribute crawl are sufficient; browser LCP attribution remains separate.

### HZ321-D02 — General public metadata and discovery assets are healthy outside the named defects

- **Severity:** Low
- **Category:** Metadata / SEO
- **Affected route/component/file:** 36 live sitemap routes, manifest, robots, sitemap, favicon, icons, default OG image
- **Exact observed behavior:** Every sitemap route has one canonical, a description, Open Graph title/URL, Twitter title, and parseable JSON-LD. Manifest, robots, sitemap, and favicon return correct success statuses and MIME types. `feed.xml` returns 404 because the release feed flag is intentionally off.
- **Expected behavior:** Observed, except HZ321-F01/F02/F04.
- **Reproduction steps:** Crawl every sitemap URL and parse head/JSON-LD; request discovery assets; inspect raster dimensions.
- **Evidence:** Default OG image is 1200×630; manifest images are exactly 192×192 and 512×512; Apple icon is 180×180. No duplicate canonical occurred on valid routes.
- **Likely root cause:** Not applicable.
- **Confidence:** Very high
- **Covered by known v3.2.1 issues:** No additional defect beyond the confirmed 404/title findings.
- **Recommended fix direction:** No broad metadata rewrite.
- **Regression test appropriate:** Retain sitemap and metadata smoke checks.

### HZ321-D03 — Valid public navigation and unauthenticated Studio/API boundaries are healthy

- **Severity:** Low
- **Category:** Routing / API / authorization
- **Affected route/component/file:** public internal links, public search/preview APIs, Studio middleware routes
- **Exact observed behavior:** All 77 local and 90 live unique internal links resolved below HTTP 400. Normal and dynamic public pages returned 200; trailing slash normalization returned 308; invalid filters did not crash. Public search clamps negative, zero, fractional, nonfinite, and very large limits. Invalid preview requests returned 400; unauthenticated preview returned 401; unauthenticated Studio APIs returned 401; Studio documents redirected 307 to login with callback URL.
- **Expected behavior:** Observed.
- **Reproduction steps:** Run the internal-link crawl and route/API matrix with redirects disabled.
- **Evidence:** No bad internal link in either crawl. `/api/studio/readiness` and `/api/studio/search` were both protected by middleware.
- **Likely root cause:** Not applicable.
- **Confidence:** Very high for unauthenticated paths.
- **Covered by known v3.2.1 issues:** No.
- **Recommended fix direction:** No change. Authenticated Studio remains a stated limitation.
- **Regression test appropriate:** Existing route/middleware tests plus smoke checks are sufficient.

### HZ321-D04 — No new M32-M65 regression evidence

- **Severity:** Low
- **Category:** Architecture boundary / database / cache
- **Affected route/component/file:** Mongo readiness, public ISR/cache design, Studio readiness gate
- **Exact observed behavior:** Builds/tests pass, normal public responses are healthy, unauthenticated readiness remains protected, and no new connection/readiness failure was generated in the permitted checks.
- **Expected behavior:** Preserve v3.2.0's five-second bounded readiness and existing cache semantics.
- **Reproduction steps:** Review the current-stage log and release diff; run normal validation and nonmutating route checks.
- **Evidence:** No fault or trace points to the completed M32-M65 work. Production responses continue to show cache hits for public pages.
- **Likely root cause:** Not applicable.
- **Confidence:** Medium; this was not a new performance campaign.
- **Covered by known v3.2.1 issues:** Explicitly outside scope unless new evidence appears.
- **Recommended fix direction:** Do not alter pool settings, Atlas, region, readiness timeout, ISR, or cache tags for v3.2.1.
- **Regression test appropriate:** Existing Mongo lifecycle/readiness and performance regression tests remain the appropriate coverage.

### HZ321-D05 — Five live-only Blueprint sitemap entries are data-state variance, not proven inconsistency

- **Severity:** Low
- **Category:** Environment limitation / content freshness
- **Affected route/component/file:** local versus live sitemap
- **Exact observed behavior:** Live exposes five additional valid Blueprint URLs: `government-minimal`, `hospitality-luxury`, `legal-classic`, `manufacturing-industrial`, and `media-expressive`. All return 200 and are linked internally.
- **Expected behavior:** Local and production may differ when they read different cached/data snapshots; equality is not guaranteed by source alone.
- **Reproduction steps:** Diff the local and live sitemap URL sets.
- **Evidence:** There were no local-only URLs and none of the five live-only routes was broken.
- **Likely root cause:** Published content/cache/environment freshness, not route code.
- **Confidence:** High that it is not currently evidence of a bug.
- **Covered by known v3.2.1 issues:** No.
- **Recommended fix direction:** Do not change data or cache settings. Confirm environment identity only if byte-for-byte content parity becomes a release requirement.
- **Regression test appropriate:** No.

## 4. Confirmed v3.2.1 bugs

The focused v3.2.1 bug set should be:

1. HZ321-F01 — multiple-root global 404 failure and unstyled production fallback.
2. HZ321-F02 — HTTP 200/no-JS-empty dynamic missing-record routes.
3. HZ321-F03 — null route loading boundary/footer shift and associated navigation CLS.
4. HZ321-F04 — global public title mojibake.
5. HZ321-F05 — Speed Insights/privacy disclosure mismatch.
6. HZ321-F06 — unnamed global-search combobox.
7. HZ321-F07 — repeated Engineering Profile heading-level skips.

HZ321-L01 through L03 should enter v3.2.1 only after their small targeted tests reproduce the presentation/race behavior.

## 5. Recommended priority order

1. **Repair the 404 architecture (F01)** while preserving the independent Studio root and readiness gate.
2. **Make missing detail records real 404s (F02)** and ensure the status content exists without client JavaScript.
3. **Implement stable public loading geometry and measure it (F03)**; this is the highest-confidence application-controlled CLS source.
4. **Resolve the privacy/telemetry mismatch (F05)** before calling the next deployment release-ready.
5. **Fix the title template encoding (F04)** with a narrow code-point change.
6. **Add the search combobox name (F06)**.
7. **Normalize profile heading structure (F07)** without broad renderer changes.
8. **Run isolated confirmation tests for L01-L03**, then decide inclusion by reproduced impact.

## 6. Bugs and risks that should not be fixed in v3.2.1

- Do not reopen M32-M65 or change MongoDB pool configuration, readiness bounds, Atlas settings, Vercel region, cache keys/tags, ISR, or invalidation semantics. No new evidence supports doing so.
- Do not run `npm audit fix --force` or take a breaking Next.js 16 upgrade as part of this patch.
- Do not mass-format 636 files. The formatter failure is a Windows EOL-policy issue and should be addressed as a planned tooling change.
- Do not globally add lazy loading. The current image system already reserves dimensions and makes largely correct route-specific eager/lazy choices.
- Do not broadly rewrite `ProseRenderer`; fix only the proven embedding/heading contract.
- Do not modify content, production data, or cache settings to force the local sitemap to match the five additional live Blueprints.
- Do not change the Blueprint disclosure solely from source inference unless the no-JS/mobile behavior is first confirmed against the supported browser/product contract.

## 7. Tests that should be added

1. Global 404 integration test in both `next dev` and `next start`: 404 status, CSS present, correct title/canonical, one main/H1, then verify an ordinary route still returns 200.
2. Parameterized missing-detail test across all seven families: HTTP 404, server-readable not-found copy, no absent-URL canonical, one robots policy.
3. Public loading tests: nonempty semantic fallback plus a throttled browser navigation asserting footer position and recording layout-shift attribution.
4. Metadata test asserting U+2014 in the resolved title for index and dynamic pages.
5. Release/privacy check coupling enabled public analytics to a reviewed disclosure.
6. Search-dialog test that opens the dialog and locates the combobox by accessible name.
7. Profile document-outline test rejecting H2-to-H4 skips for interview and timeline roles.
8. Query-rejection tests for the public empty/not-found masking paths in L01.
9. Two-request ordering test for Media Picker and non-OK-response tests for Command Palette.

## 8. Areas needing deeper investigation

- **Field CLS attribution:** collect real `layout-shift` entries with impacted nodes on `/`, `/blueprints`, and client navigation. The null fallback is proven structurally, but supplied field CLS cannot be partitioned without traces.
- **Authenticated Studio:** verify the 64 Studio page files through representative role/ownership matrices, editor save/discard/back-forward behavior, Media Picker races, command palette expiry, dialogs, keyboard navigation, and loading/error states.
- **Browser accessibility/responsive behavior:** complete keyboard, focus trap/restore, skip-link, touch target, mobile/tablet overflow, and reduced-motion checks once the browser policy permits control.
- **Public failure contract:** use mocked/local fault injection only to distinguish empty data, missing data, pre-stream failures, and post-stream failures. Do not use production or change readiness/cache configuration.
- **Speed Insights disclosure:** document the actual production processor/data/retention/control facts before choosing disclosure language.
- **No-JS Blueprint disclosure:** confirm the supported progressive-enhancement expectation on a long Blueprint capability list.

## 9. Exact commands and checks performed

### Bootstrap and repository state

```powershell
Get-Content -Raw docs/operations/ENGINEERING_BOOTSTRAP.md
Get-Content -Raw .hubzero/agents/AGENTS.md
Get-Content -Raw AGENTS.md
Get-Content -Raw docs/README.md
Get-Content -Raw docs/design/DESIGN_SYSTEM.md
Get-Content -Raw docs/architecture/EXPERIENCE_V3_PROGRESS.md
Get-Content -Raw docs/architecture/PUBLIC_DATA_LAYER.md
Get-Content -Raw docs/architecture/PLANNING.md
git status --short --branch
git rev-parse HEAD
git rev-parse 'v3.2.0^{}'
git describe --tags --always --dirty
git log --oneline --decorate -8
git diff --stat 7a97aaf..HEAD
git diff --check 7a97aaf..HEAD
git show --stat --oneline 1788727
git show --format= --find-renames 7a97aaf -- src/app/layout.tsx src/app/root-document.tsx 'src/app/(public)/layout.tsx' src/app/studio/layout.tsx src/app/not-found.tsx
node -p "require('./package.json').version"
node --version
npm --version
npm ls --depth=0
```

### Static validation

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run build
npm audit --audit-level=low
npm run format:check
git ls-files --eol package.json 'src/app/(public)/loading.tsx' '.prettierrc.json'
git config --show-origin --get core.autocrlf
rg -n --glob '!src/app/icon0.svg' --glob '!*.map' 'TODO|FIXME|HACK|XXX' src scripts
rg -n 'catch\s*\{|\.catch\(|Promise\.allSettled|return null|return \[\]' src/app src/lib src/components
rg -n 'addEventListener|setInterval|setTimeout|ResizeObserver|IntersectionObserver|MutationObserver' src/components src/lib -g '*.tsx' -g '*.ts'
```

### Servers and HTTP matrices

```powershell
node .\node_modules\next\dist\bin\next dev -p 3100
node .\node_modules\next\dist\bin\next dev -p 3102
node .\node_modules\next\dist\bin\next start -p 3101
```

The development server was restarted between unmatched-route checks to prove that the global 404 request, not initial startup, contaminated later development responses. Local-production and live matrices used Node 22 `fetch` with `redirect: 'manual'` for:

```text
/, every local/live sitemap URL, all seven /{family}/does-not-exist URLs,
/doesnotexist, malformed percent encoding, trailing and double slashes,
collection filter query strings, /search queries,
/api/search with missing/negative/zero/fractional/huge/nonfinite limits,
/api/preview with missing/invalid/unauthenticated values,
/api/studio/readiness, /api/studio/search,
/studio, /studio/login, /studio/doesnotexist,
/manifest.json, /robots.txt, /sitemap.xml, /feed.xml, /favicon.ico,
/_vercel/speed-insights/script.js
```

### Automated read-only crawls

One-off `node -` scripts using built-in `fetch`, `jsdom`, `dom-accessibility-api`, and `sharp` performed these checks without writing repository files:

- local and live sitemap extraction/diff;
- internal-link extraction and status crawl (77 local, 90 live);
- title, description, canonical, robots, Open Graph, Twitter, stylesheet, main/H1, and JSON-LD validation;
- scripts-removed/no-JS text inspection for root and dynamic missing routes;
- duplicate-ID and heading-outline scan across all live sitemap pages;
- image `alt`/intrinsic-dimension/loading-mode scan and all unique image URL status checks;
- icon/manifest/OG raster-dimension inspection with `sharp`;
- raw UTF-8 scan for U+00E2/U+FFFD source corruption;
- accessible-name computation for the search-dialog input attributes;
- live Speed Insights script capability-string inspection.

### Browser control attempt

The in-app browser was initialized after temporarily switching Node from 22.14.0 to the installed 22.23.1 runtime required by the browser client. Both localhost and production navigation were rejected twice because the administrator-enforced browser security policy could not be verified. The session was finalized without retained tabs. No Playwright or alternate browser-control stack was used to bypass the policy.

## 10. Local-environment limitations

- The tested source tree is two commits ahead of the release tag; results explicitly distinguish the post-tag Speed Insights change.
- Browser policy prevented visual screenshots, interaction traces, real viewport overflow checks, keyboard/focus testing, and browser-based layout-shift attribution.
- No authenticated Studio session was exercised. Studio findings are limited to source analysis, passing tests/build, and unauthenticated boundaries.
- No database fault injection, mutation, seed, destructive operation, or production-data access was performed.
- Local `.env.local` metadata resolves canonicals against `http://localhost:3000` while the production server was intentionally run on port 3101. That local-port mismatch is environmental and was not reported as an application bug.
- Local and live data snapshots differ by five valid published Blueprint routes; no inference about production cache correctness was made from that difference.
- `format:check` is not a reliable formatting signal in this checkout because Git converted LF blobs to CRLF on Windows.
- The supplied production CWV values were treated as field evidence. No local synthetic timing was relabelled as production performance evidence.

## 11. Investigation integrity

No production configuration, environment variable, Atlas setting, production data, deployment configuration, cache behavior, MongoDB pool setting, or region was changed. No deployment, commit, push, database write, destructive command, `npm audit fix`, or `npm audit fix --force` was performed. The only repository change is this report.
