# Public Motion Guidelines

**Status:** Implemented. Phase 12 design proposal; these motion guidelines are live across the public site.

**Canonical base:** `DESIGN_SYSTEM.md` §6 and `.hubzero/design/motion.md`

Motion is a public expression of engineering logic. It should reveal how parts relate, confirm how state changed, and preserve where the visitor came from.

“Draw rather than fade. Reveal rather than appear. Construct rather than animate.” is a directional test, not permission to add literal engineering decoration. Circuit traces, blueprint lines, ambient grids, and scroll spectacle remain prohibited.

## Principles

1. **Causality first.** Movement begins from the element or action that caused the change.
2. **Structure over entrance.** Reveal grouping, order, lineage, or progress; do not animate content merely because it entered the viewport.
3. **Continuity over replacement.** Shared context persists between source and destination.
4. **Input owns time.** Direct interactions feel immediate. Scroll-linked movement stays exactly tied to scroll and reverses with it.
5. **One chapter moment at a time.** A major narrative moment may carry considered motion; surrounding content stays quiet.
6. **Content is never gated.** Essential text and controls remain understandable at rest, before animation, and with motion disabled.
7. **Exit is faster.** Leaving a state should restore control quickly.
8. **Performance is part of meaning.** Dropped frames communicate poor engineering regardless of visual intent.

## Motion vocabulary

### Draw

Use progressive construction only when it explains an actual structure:

- A Lab milestone track extends to the current stage.
- A typed relationship connects a source label to a destination label during an explicit transition.
- A table-of-contents marker advances with the reader's current section.
- A technical diagram reveals dependencies in reading order.

The line is neutral and structural. Amber may mark the current active state only; it does not become a decorative stroke.

### Reveal

Use clipping, height, or spatial disclosure when content already belongs to the current object:

- Expanding architecture detail beneath its decision summary.
- Revealing card metadata on hover/focus while keeping it available on touch.
- Opening a filter result count and updated set together.
- Showing a Lab's next milestone from its current-stage row.

Reveal preserves the originating surface so the relationship remains legible.

### Construct

Use ordered assembly when a system has meaningful parts:

- A Build architecture moves from boundary to components to data flow.
- The four-pillar model introduces its nouns before showing real cross-links.
- An Engineering Profile transition retains the person's identity while evidence modules assemble around it.

Construction order follows comprehension order, never arbitrary stagger indexes.

### Settle

Use the canonical short positional settle for a new page or stable state:

- New view: opacity plus no more than 10px vertical movement.
- Persistent navigation does not re-enter.
- Layout shifts caused by loaded content are not “settle”; they are bugs to prevent.

### Confirm

Use immediate feedback for direct input:

- Button press.
- Filter toggle.
- Copy reference ID.
- Search selection.
- Contact submission state.

The state label or visual property changes with the motion; motion alone never communicates success.

## Timing and easing

The canonical two speed bands remain:

| Band | Duration | Use |
|---|---:|---|
| Immediate | 120–250ms | Hover, press, focus-adjacent response, filter, toggle, small disclosure |
| Considered | 300–500ms | Page/view change, overlay, relationship transition, major disclosure |

- Default easing: `cubic-bezier(.2,.8,.2,1)`.
- Press response: 100–120ms, scale `.96–.97` only for pressable controls.
- Exit target: approximately 200ms.
- No bounce, elastic overshoot, ambient float, or spring behavior that reads as playful instability.
- No public transition exceeds 500ms without an approved, documented chapter-specific reason.

Delay is generally zero. Small sequencing delays are allowed only when they express dependency. Never stagger long lists; the visitor already understands list order.

## Pattern specifications

### Global navigation

- Remains fixed and visually stable across page changes.
- Active destination changes fill/state within the immediate band.
- Search opens from the visible Search control into the palette; focus moves to the query input.
- The mobile destination track may scroll to keep the active item visible, but must not animate continuously with page scroll.

### Page transition

```text
Trigger → URL/state commits → new main content settles → focus/announcement resolves
```

- Old content does not perform a long exit.
- New content uses the canonical fade + ≤10px settle.
- A collection-to-detail transition may preserve one shared identity element—title, reference ID, or media frame—only if it does not compromise native navigation, performance, or reduced motion.
- Browser back restores the prior list/filter/scroll state.

### Typed relationship transition

Used for deliberate transitions such as Lab → Build or Build → Blueprint.

1. Source relationship label acknowledges activation immediately.
2. Shared reference or title remains spatially continuous where practical.
3. Destination collection and state become visible before secondary detail.
4. Back navigation restores the source relation in focus.

This is a candidate signature interaction for the public site. It should be prototyped once and reused, not reinvented per relationship.

### Cards and editorial rows

- Cards lift 4–6px; they never scale on hover, tilt, or follow the cursor.
- Hover/focus may disclose useful metadata within 120–200ms.
- On touch, metadata is present or available through an explicit control; hover is never the only route.
- Editorial rows prefer fill, underline-offset, or metadata reveal to physical lift when they are not card-shaped surfaces.

### Filters

- Active chip state changes immediately and remains visible in grayscale plus amber's permitted selected-state use.
- Result changes should preserve stable items in place where possible; avoid animating every item out and back in.
- New ordering may use a short layout transition only when it helps track items.
- Result count and URL state update with the collection.

### Search palette

- Opens with considered scale `.98 → 1` plus opacity; exits faster.
- Results respond without artificial typing delay.
- Selection state moves immediately with arrow keys.
- Empty and no-result states are static, explicit content—not animation opportunities.

### Document navigation

- The active section indicator moves or draws as reading position changes.
- Heading content does not animate on scroll.
- Anchored navigation uses native or restrained smooth scrolling only when reduced motion is not requested; focus and URL fragment update correctly.

### Lab progress

- Milestone construction is driven by real milestone data.
- Completed, current, and future states differ through labels and neutral/status tokens.
- The progress line may draw once as the component is deliberately engaged or scrub with scroll if it remains reversible.
- Never animate a status dot continuously.

### Architecture and diagrams

- Start with the system boundary, then reveal components, then connections, then annotations.
- Every step corresponds to a textual explanation.
- The final static diagram contains the complete information.
- Auto-playing flow lines, particles, and infinite data pulses are prohibited.

### Engineering Profile transition

- From About, retain the person's name/portrait anchor while the view expands from roster identity to evidence.
- Evidence modules reveal by narrative role, not a generic cascade.
- Switching between profile lenses preserves the profile header and scroll context where reasonable.
- Profile-to-artifact transitions use the same typed relationship behavior as the rest of the site.

### Contact submission

- Button label changes immediately to the real pending state.
- Success replaces the form with a calm confirmation and explicit response timeframe.
- No fake progress bar or celebratory animation.
- Failure keeps entered content and moves focus to a clear error summary.

## Scroll policy

Native scroll is the default. Do not install global smooth scrolling merely to change the site's feel.

Each detail page may use at most one or two scroll-linked moments, and only when all are true:

- the movement is reversible;
- position maps 1:1 to scroll;
- the static state remains complete;
- the effect helps understand sequence, architecture, or progress;
- it remains performant on a mid-range mobile device.

Pinned sections, scroll-jacking, forced horizontal chapters, and one-shot viewport entrance cascades are not part of the motion language.

## Reduced motion

`prefers-reduced-motion: reduce` receives equivalent information and feedback:

| Standard behavior | Reduced-motion behavior |
|---|---|
| Draw/construct sequence | Complete static structure appears at once |
| Shared-element travel | Direct view change with short opacity transition or none |
| Card lift | Fill/border/focus state only |
| Smooth anchor scroll | Immediate jump with correct focus |
| Scroll-linked diagram | Static final diagram plus current text state |
| Overlay scale + fade | Short opacity-only transition |

Reduced motion is a design mode, not a CSS cleanup at the end.

## Mobile motion

- Prefer opacity, clip, and small-axis movement over large spatial travel.
- Do not animate elements under the user's thumb after they tap.
- Recomposition between desktop and mobile must not leave motion assumptions tied to a removed column or hover state.
- Avoid sticky sequences that consume most of a small viewport.
- Test orientation changes and browser UI expansion; viewport shifts must not restart chapter motion.

## Performance budget and implementation constraints

Future implementation should establish a motion budget before choosing a library:

- Animate compositor-friendly properties (`transform`, `opacity`) for frequent interactions.
- Use layout animation selectively; measure it with real collection sizes.
- Lazy-load chapter-specific motion code.
- Avoid hydrating static Document blocks solely to animate their entrance.
- Prevent cumulative layout shift by reserving media dimensions.
- Target sustained 60fps on representative mid-range mobile hardware; correctness and input response take priority over an effect.
- Independently derive scroll, navigation, overlay, and active-section state, consistent with `.hubzero/principles.md`.

## Motion review questions

Every proposed motion must answer:

1. What relationship, hierarchy, state, or feedback does it communicate?
2. What triggers it, and is the trigger obvious?
3. What is the complete static equivalent?
4. Does it preserve focus, reading position, and browser navigation?
5. Does it still work on touch and with reduced motion?
6. Can it stay below 500ms and within the performance budget?
7. If removed, what useful information is lost?

If question 1 or 7 has no concrete answer, remove the motion.
