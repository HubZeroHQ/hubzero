# Product Discoverability

Not every HubZero product is discovered through classic web search. SDKs are found in package registries, mobile apps in app stores, internal tools through an internal directory, and open-source tools through code hosting search. Discoverability is the general practice of making a product findable wherever its actual users look — web search is one channel among several, not the whole discipline.

---

# Discovery Surfaces by Product Type

- **Web products** (marketing sites, dashboards, SaaS) — classic search engines. See `marketing-sites.md`, `documentation.md`, `knowledge-bases.md`.
- **SDKs and libraries** — package registries (npm, PyPI, crates.io, etc.), and code hosting search. Discoverability here means an accurate package description, complete metadata, relevant keywords/tags, and a README that answers "should I use this" within the first screen.
- **APIs** — developer search behavior and package-registry adjacent SDKs. See `developer-documentation.md`.
- **Mobile applications** — app store search and category placement. Discoverability depends on store listing title, subtitle, keywords, screenshots, and category selection, not on-page SEO.
- **Internal tools and dashboards** — an internal directory, wiki, or catalog rather than public search. Discoverability here means accurate naming, an up-to-date internal description, and being registered wherever internal tools are indexed, so the product doesn't quietly become tribal knowledge.
- **AI products** — both classic search and increasingly, being surfaced correctly within other AI systems and assistants (accurate structured descriptions of capability, clear naming that disambiguates from similarly-named tools).

---

# Metadata Applies Everywhere

Every discovery surface has its own metadata system, and each one deserves the same care as a webpage's title tag and meta description:

- Package registries: package name, description, keywords, README summary.
- App stores: title, subtitle, keyword field, category.
- Internal catalogs: name, one-line description, owner, tags.
- Repositories: repository description, topics/tags, README.

Treat all of these as first-class discoverability surfaces, not administrative afterthoughts filled in during publishing.

---

# Naming Matters More Than It Seems

A product's name and the terms it's described with determine whether it's findable at all, independent of everything else in this document. Prefer names and descriptions that use the vocabulary the actual audience searches with, over internal project names or clever branding that means nothing outside the team that built it.

---

# Common Mistakes

- Treating a package or app store listing as a formality instead of a discoverability surface
- Internal tools with no entry in any internal catalog, discoverable only by asking around
- Naming that prioritizes cleverness over the vocabulary users actually search with
- Copying web SEO tactics onto a surface (app store, package registry) that ranks on entirely different signals

---

# Success Metrics

Vary by surface: organic package installs, app store impressions-to-installs, internal tool adoption without direct onboarding, and — where applicable — traditional organic search metrics from the other documents in this directory.
