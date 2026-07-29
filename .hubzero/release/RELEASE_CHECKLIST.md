# HubZero Release Checklist

> [!IMPORTANT]
> **This document is part of HubZero Core and is considered a canonical engineering standard.**
>
> **It must never be modified, rewritten, reformatted, or extended by AI agents, automation tools, or end users.**
>
> This checklist defines the minimum release requirements for every HubZero product.
>
> If a product requires additional release requirements, they must be documented separately within that product's own documentation. They must **never** be added to, removed from, or alter this document.
>
> AI agents may **read**, **reference**, and **execute** this checklist, but they must **never edit it** under any circumstances.
>
> Any changes to this document may only be made by the maintainers of HubZero Core through an intentional versioned update.

---

# HubZero Release Checklist

This checklist defines the minimum quality standard required before any HubZero product may be released.

A product is considered **production-ready** only when every applicable item has been completed successfully. Not every item applies to every product type (an API has no "pages"; an internal tool has no public SEO surface) — skip only what genuinely does not apply, and say so explicitly rather than silently ignoring a section.

---

# 1. Repository

## Repository Identity

- [ ] Repository name matches the product name.
- [ ] Package name matches the product.
- [ ] Version updated appropriately.
- [ ] Repository URLs are correct.
- [ ] License is present.
- [ ] Author information is correct.
- [ ] Keywords and description are complete.

---

# 2. HubZero Core Compliance

- [ ] `.hubzero` remains unchanged.
- [ ] Architecture guidance has been followed (`.hubzero/architecture/principles.md`).
- [ ] Design guidance has been followed (`.hubzero/design/principles.md`).
- [ ] SEO or discoverability guidance has been followed, where applicable (`.hubzero/seo/`).
- [ ] Engineering guidance has been followed (`.hubzero/principles.md`).
- [ ] Existing project infrastructure has been reused rather than recreated (config, providers, utilities, shared components).

---

# 3. Engineering

## Code Quality

- [ ] No unused code.
- [ ] No dead files.
- [ ] No duplicated logic.
- [ ] No unnecessary abstractions.
- [ ] No unnecessary dependencies.
- [ ] Types used consistently where the language supports them.
- [ ] No untyped escape hatches (e.g. `any`) unless absolutely necessary.

---

# 4. Design System

Verify consistency across the entire product.

- [ ] Typography
- [ ] Color tokens
- [ ] Spacing scale
- [ ] Layout containers
- [ ] Buttons and interactive controls
- [ ] Cards or equivalent content containers
- [ ] Forms
- [ ] Navigation
- [ ] Responsive behavior
- [ ] Motion consistency

---

# 5. Content and Configuration

Verify content and configuration remain properly separated from implementation, per `.hubzero/principles.md` — Configuration Over Hardcoding.

- [ ] Branding and identity isolated from component logic.
- [ ] Navigation, if any, configurable rather than hardcoded.
- [ ] Environment-specific values externalized, not embedded in code.
- [ ] User-facing copy and content easy to locate and update.
- [ ] Metadata configurable.

---

# 6. Assets

Verify all images, icons, and media.

- [ ] Optimized for their delivery context.
- [ ] Responsive where applicable.
- [ ] Consistent visual language.
- [ ] Correct aspect ratios.
- [ ] No broken links or missing assets.
- [ ] Alt text or equivalent accessible description present.

---

# 7. Accessibility

Verify accessibility.

- [ ] Semantic markup.
- [ ] Proper heading hierarchy, where applicable.
- [ ] Keyboard navigation.
- [ ] Focus states.
- [ ] Accessible forms and inputs.
- [ ] Sufficient color contrast.
- [ ] Reduced motion respected.
- [ ] Meaningful alt text and labels.

Target WCAG AA compliance for any user-facing interface.

---

# 8. SEO and Discoverability

Verify discoverability appropriate to the product's actual discovery surface — see `.hubzero/seo/product-discoverability.md`.

- [ ] Metadata (web products).
- [ ] Open Graph and social card metadata (web products).
- [ ] Canonical URLs (web products).
- [ ] Robots and sitemap (web products).
- [ ] Structured data where appropriate (web products).
- [ ] Package registry metadata complete (SDKs and libraries).
- [ ] App store listing metadata complete (mobile apps).
- [ ] Internal catalog entry present and accurate (internal tools).

---

# 9. Required Surfaces

Verify every user-facing surface required for this specific product is complete. There is no fixed list — determine required surfaces from the product's architecture (`.hubzero/architecture/principles.md`) and confirm each one:

- [ ] Loads or responds successfully.
- [ ] Handles its documented error and edge cases.
- [ ] Contains no placeholder or stub content.

---

# 10. Runtime Verification

- [ ] Every required surface loads or responds successfully.
- [ ] No console errors or unhandled exceptions.
- [ ] No hydration or rendering warnings, where applicable.
- [ ] Dynamic routes, endpoints, or states function correctly.
- [ ] Navigation or primary user flow works end to end.
- [ ] Images and media load correctly.

---

# 11. Build Verification

Run every verification command applicable to this product (adapt commands to the product's actual toolchain):

```bash
npm install
npm run lint
npm run typecheck
npm run build
npm test
```

Confirm:

- [ ] Installation successful.
- [ ] Lint passes.
- [ ] Type checking passes.
- [ ] Build passes.
- [ ] Tests pass.

---

# 12. Documentation

Verify documentation.

- [ ] README complete.
- [ ] Installation instructions.
- [ ] Development instructions.
- [ ] Build instructions.
- [ ] Configuration or customization guide.
- [ ] Folder structure explained where non-obvious.
- [ ] Screenshots or examples included where helpful.

---

# 13. Release Assets

Prepare release assets.

- [ ] Relevant screenshots or demo material.
- [ ] Release notes.
- [ ] Changelog updated.
- [ ] Version bumped.
- [ ] Git tag prepared.

---

# 14. Product Polish

Verify the product satisfies `.hubzero/polish/PRODUCT_POLISH.md` in full.

- [ ] Engineering Review complete.
- [ ] Design Review complete.
- [ ] Mobile Experience pass complete, where applicable.
- [ ] Product Polish pass complete.
- [ ] No temporary tooling, scratch files, or debug scaffolding remains in the repository.

This section verifies the polish standard, not just technical completeness. Do not duplicate its criteria here — consult the referenced document directly.

---

# 15. Final Review

Review the product holistically.

Ask:

- Does this feel like finished, production-quality work?
- Is the architecture maintainable?
- Does the design system remain consistent?
- Could another engineer confidently build upon this foundation?

If any answer is "No", address it before releasing.

---

# Release Approval

## Verification

- [ ] All checklist items complete.
- [ ] Repository reviewed.
- [ ] Final manual walkthrough completed.

## Release Decision

- [ ] Ready for Release
- [ ] Requires Additional Work

---

## Release Information

Product:

Version:

Release Date:

Reviewed By:

Approved By:

Git Commit:

Git Tag:
