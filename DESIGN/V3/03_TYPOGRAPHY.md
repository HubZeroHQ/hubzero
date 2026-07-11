# 03 — Typography

> Assumes `02_VISUAL_LANGUAGE.md`. Per the brief's own instruction: do not change fonts unless there is a compelling reason. This document keeps two of three current families unmodified and retires the third with a specific, named justification in §6 — it does not treat typography as a place to express novelty for its own sake.

## 1. The family (what stays, what goes)

**Geist Sans — stays, unmodified.** It is neutral, technical without being cold, still uncommon enough on the web to read as a considered choice rather than a default, and it already carries the great majority of HubZero's copy correctly. There is no compelling reason to replace it: it fails none of `01_VISION.md`'s five emotional goals, and replacing a working workhorse typeface for novelty's own sake is exactly the "modern for modern's sake" failure this whole exercise is checked against.

**Geist Mono — stays, unmodified, and its role expands.** Reserved for genuinely technical content (code, stack names, dates, metadata, diagram annotation) exactly as today — and, under Working Blueprint, it takes on a larger and more central job than in v2, because dimension lines, technical labels, and diagram annotation (`02_VISUAL_LANGUAGE.md` §9–10) are new, frequent surfaces that all belong in this register. Geist Mono is, in effect, promoted from "reserved for facts" to "the voice of the drafting-sheet vocabulary" — the same typeface, a larger and more clearly defined job.

**Instrument Serif — retired.** See §6 for the full reasoning. **IBM Plex Serif** replaces it as the rare, named "slow-down" display serif.

No other family is introduced. Three typefaces, three distinct and non-overlapping jobs, is the same discipline v2 already had — Working Blueprint changes which serif holds the third job, not how many families exist or what job each one does.

## 2. Display typography

**Job:** the one sentence per page that should dominate a reader's first three seconds — a hero headline, a case-study's opening claim.

- **Typeface:** Geist Sans, weight 500–600 (Medium/Semibold — no heavier; per `ARCHITECTURE/07_DESIGN_SYSTEM.md` §1's still-correct reasoning, anything heavier reads as shouty rather than confident).
- **Scale:** fluid, content-driven rather than a fixed pixel value — a `clamp()` range anchored around 56–88px at desktop widths, allowed to run larger than v2's 56–72px ceiling specifically because Working Blueprint's drafting-sheet composition (`02` §1) gives display type more room to be the singular, dominant element on a page, per `ARCHITECTURE/15_HOMEPAGE_DESIGN.md` §4's already-correct "impact-driven, not viewport-driven" sizing logic.
- **Letter-spacing:** -0.03 to -0.04em — tight, mechanical, closer to a title-block's lettering than a magazine masthead's.
- **Line-height:** 1.05–1.1 — display type is rarely more than two lines; when it wraps to two, the lines should read as tightly bound to each other, not as separate statements.
- **Color:** near-full-contrast ink/paper — never the copper accent applied to an entire headline as a fill. Copper may appear as an inline emphasis on one word or phrase within a headline (see §9), never as the headline's default color.

## 3. Editorial typography

**Job:** the rare, named slow-down moment — a pull quote, a single emphasized word within a headline, a case-study's one moment of genuine narrative pause.

- **Typeface:** IBM Plex Serif, one weight (Text/Regular for pull quotes; Medium where a slightly firmer emphasis is needed), used upright by default — not italic-by-default the way Instrument Serif was. Italic is available as a secondary emphasis _within_ a Plex Serif moment (to distinguish an attributed quote's speaker, for instance) but the family's default posture is upright, because an upright serif reads as a considered statement, where a default-italic register reads as a whisper — the wrong register for a company asking a skeptical buyer to trust it with a six-figure engagement.
- **Where it appears:** exactly the same disciplined budget v2 already tried to establish and then lost in production (`docs/design-reviews/MARKETING_SITE_REVIEW_V1.md` §4) — a small, named set of moments per page, not a routine section-opener. v3's explicit numeric budget: **at most one Plex Serif moment per page**, full stop, with a standing exception only for the homepage (which may use two: one hero emphasis word, one case-study pull-line, mirroring the already-approved `ARCHITECTURE/15` structure). This is stricter than v2's unenforced "small, named set" language specifically because the unenforced version is what broke down in production.
- **Scale:** set noticeably larger than surrounding body copy (roughly 1.4–1.8× body size) so its rarity reads as intentional rather than accidental — a pull quote set close to body size doesn't look restrained, it looks like a mistake.

## 4. Body copy

- **Typeface:** Geist Sans, Regular (400).
- **Scale:** 17–18px, unchanged from v2 — this was already correct (`ARCHITECTURE/07_DESIGN_SYSTEM.md` §1's "premium sites set body copy larger than instinct suggests" finding holds regardless of visual direction).
- **Line-height:** 1.5–1.6.
- **Measure (max line length):** 65–75 characters for general body copy, tightened to 60–68 characters for long-form reading (Notes, case-study narrative body) — long-form prose benefits from a slightly narrower column than general marketing copy, which is why `05_LAYOUT_SYSTEM.md` §1 keeps a distinct, narrower content-width token for prose contexts.
- **Color:** ink/paper text token, never the copper accent — body copy is never colorized for emphasis; emphasis within body copy is carried by weight (Medium, sparingly) or, in the single rare case warranted, an inline link in the accent color.

## 5. Captions

- **Typeface:** Geist Sans, Regular, smaller size (13–14px) OR Geist Mono where the caption is describing a technical artifact (a figure caption under a diagram, per `02_VISUAL_LANGUAGE.md` §5's figure convention) — the choice of sans-vs-mono for a caption is itself meaningful: mono signals "this describes a technical artifact," sans signals "this is a general descriptive note."
- **Color:** muted-text token, always — a caption should never compete with its own image or diagram for visual weight.

## 6. Why Instrument Serif is retired (the one typeface change, justified)

Three reasons, each independently sufficient:

1. **Trend-saturation, directly contradicting the "timeless, not trendy" mandate.** Instrument Serif is one of the most heavily adopted display serifs across editorial-styled AI-assisted and startup design specifically in the period v3 is being designed in — it has become close to a default "trendy editorial" signal, the same way a particular sans became the default "clean SaaS" signal a few years earlier. A typeface chosen to differentiate HubZero from generic AI-generated design should not be the specific typeface currently most associated with that genre.
2. **No connection to engineering credibility.** Instrument Serif is a fashion/lifestyle-editorial typeface with no organizational or technical pedigree — it was never designed for, or by, an engineering-adjacent institution. It does a fine job of _looking_ editorial; it does nothing to reinforce `01_VISION.md`'s "precise" and "material" emotional goals.
3. **A better-justified replacement exists.** IBM Plex Serif was commissioned by IBM specifically to give a large technology and engineering organization a complete, coherent, owned type voice (paired natively with Plex Sans and Plex Mono) rather than relying on a licensed "generic tech" typeface — real organizational pedigree, directly relevant to an engineering studio's credibility, and meaningfully less trend-saturated in editorial design right now than Instrument Serif. This is the same reasoning `00_EXPLORATION.md` §9 cites IBM Design for: not imitating IBM's brand, but recognizing that a typeface built for exactly this kind of institutional-engineering credibility already exists and doesn't need to be invented or borrowed from an unrelated genre.

**What does not change alongside this:** the _role_ IBM Plex Serif plays is identical to Instrument Serif's intended (if not always executed) role — a rare, named slow-down device, never a default heading font, never used for more than one or two moments per page. This is a typeface substitution within an unchanged principle, not a new principle.

## 7. Technical labels

**Job:** the small, precise metadata that gives a page its "engineered" texture — dates, stack names, version numbers, step numbers, dimension annotations, diagram call-outs.

- **Typeface:** Geist Mono, always.
- **Treatment:** uppercase with wide tracking (0.08–0.12em) for short labels/eyebrows (mirroring v2's existing, already-correct `text-caption font-mono tracking-wide uppercase` pattern); regular case, tighter tracking for longer technical strings (a stack list, a file path) where uppercase would hurt legibility.
- **Numerals:** always tabular (fixed-width digits), non-negotiable wherever numbers appear in a column or alongside a label — a dimension chain, a metrics block, a table — because misaligned digits are the single fastest way for a "precise" identity to look accidentally sloppy.

## 8. Code

- **Typeface:** Geist Mono, syntax-highlighted using the site's own token palette (ink/paper base, copper for one specific semantic role — see `04_COLOR.md` §4 — never a generic third-party syntax theme's own unrelated color set pasted in unmodified).
- **Presentation:** real code, real filenames, real line numbers where relevant — a code block exists to demonstrate an actual technical decision (per `ARCHITECTURE/20_CONTENT_BLOCKS.md`'s existing `code` block type), never as decorative "looks technical" set dressing with no real content.

## 9. Metrics

**Job:** a real, verifiable number, presented with enough typographic weight that its precision is legible before it's read.

- **Value:** Geist Mono, tabular numerals, set larger and heavier than its label (a clear value/label hierarchy — the value is the evidence, the label is the citation).
- **Label:** Geist Sans or Geist Mono caption, muted-text color, describing exactly what was measured and how (per `ARCHITECTURE/17_COMPANY_STRUCTURE.md` §6's standing rule that a metric must survive being checked).
- **Never** set in the copper accent color by default — a metric's credibility should come from its precision and sourcing, not from being colorized to look important. Copper may mark a metric as the page's single most important one, at most once per page, for real hierarchy reasons — not as decoration applied to every number.

## 10. Reading rhythm

Reading rhythm is the product of measure (line length), line-height, and paragraph spacing working together, and Working Blueprint's specific contribution is treating this the same way a drafting sheet treats a dimension chain: consistent, legible, cumulative. Concretely:

- Paragraph spacing within a body of prose should be a single consistent value (not variable "whatever looks right" spacing), drawn from the same spacing scale as everything else on the page (`05_LAYOUT_SYSTEM.md` §2).
- A reader's scroll speed should track content weight — a dense technical paragraph gets slightly more breathing room before/after than a short transitional sentence, exactly as `ARCHITECTURE/15_HOMEPAGE_DESIGN.md` §5 already established for section-level rhythm, applied here at the paragraph level.

## 11. Maximum line lengths

| Context                                         | Measure                                                                                                                                                         |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| General marketing body copy                     | 65–75 characters                                                                                                                                                |
| Long-form reading (Notes, case-study narrative) | 60–68 characters                                                                                                                                                |
| Pull quotes (IBM Plex Serif)                    | 45–55 characters — short lines let the larger serif type breathe and prevents an awkward ragged-right at display scale                                          |
| Technical labels / captions                     | No fixed measure — these are short by nature; if a technical label needs to wrap to more than two lines, it's not a label anymore and should become a paragraph |
| Code                                            | No prose measure applies — code wraps or scrolls per its own content, never forced to a prose column width                                                      |

## 12. Spacing relationships

Type and spacing are governed by one shared scale, not independent systems that happen to coexist (see `05_LAYOUT_SYSTEM.md` §2 for the full scale). The specific relationships that matter for typography:

- **Heading-to-body gap** should be smaller than **body-to-next-heading gap** — this is what makes a heading read as "attached to" the content beneath it rather than floating ambiguously between two blocks, a small but frequently-violated rule worth stating explicitly.
- **A Plex Serif pull quote's surrounding whitespace** should be the page's emphasis-whitespace budget (`02_VISUAL_LANGUAGE.md` §4) spent deliberately — a rare serif moment with only rhythm-level spacing around it undersells its own rarity.
- **Technical-label rows** (a dimension chain, a metrics row) use tighter, denser spacing than prose — they are meant to be scanned as a set, not read line by line, and spacing should signal that difference immediately.
