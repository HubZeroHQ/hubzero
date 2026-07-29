# Developer Documentation SEO

API references, SDK docs, and developer portals are discovered differently from general documentation: developers search from within their editor, from error messages, from Stack Overflow-style queries, and from package registries — not only from a browser search bar.

---

# Search Intent

Developers typically search to:

- Find the exact method, endpoint, or parameter signature
- Resolve a specific error or exception message
- Confirm authentication, rate limit, or versioning behavior
- Find a working code sample in their language or framework
- Evaluate whether the SDK/API fits before integrating

---

# Primary Keyword Categories

- Exact API/method/class names, verbatim, including correct casing
- Error messages and status codes, verbatim
- Language- and framework-specific phrasing ("[SDK] python example", "[API] webhook signature verification")
- Package or module names as they appear in the relevant registry (npm, PyPI, etc.)

---

# Essential Pages

Required

- Quickstart with a working, copy-pasteable example
- Authentication and authorization
- Complete API/method reference
- Error and status code reference
- Changelog / versioning policy

Recommended

- Language-specific SDK guides
- Webhooks or events reference, if applicable
- Rate limits and quotas
- Migration guides between major versions

---

# Information Architecture

Structure around the API's actual resource and capability model, not around internal team boundaries. Reference pages should be reachable both by browsing and by searching for the exact symbol name.

Keep one canonical reference page per version. If multiple major versions are supported simultaneously, make the version unambiguous in the URL and the page itself, not just in a dropdown a searcher may never see.

---

# Internal Linking Strategy

Link every reference entry to a relevant guide or example, and every guide back to the reference entries it uses. A developer who lands on a bare reference page from search should never be one click from working code.

---

# Structured Data

Recommended

- TechArticle
- BreadcrumbList
- SoftwareSourceCode, where a canonical code sample benefits from it

---

# Content Strategy

Every example must be runnable as written. A broken or outdated code sample is worse than none, because it costs the developer time to discover it's wrong. Keep examples under test where feasible so documentation drift is caught the same way code regressions are.

---

# Technical Considerations

Ensure reference pages are server-rendered or otherwise crawlable — client-side-only rendering of API references is a common, avoidable cause of poor discoverability. Keep URLs stable across documentation platform migrations; broken deep links from search results and bookmarked pages erode developer trust quickly.

---

# Common Mistakes

- Reference content that requires JavaScript to render and isn't crawlable
- Code samples that no longer match the current API version
- No unambiguous version indicator on versioned reference pages
- Burying authentication and error-handling information instead of surfacing it early

---

# Success Metrics

Time-to-first-successful-call for new integrators, search-to-resolution rate for error queries, reduction in integration-related support requests, organic traffic to reference pages from exact-match symbol searches.
