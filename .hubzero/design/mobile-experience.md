# Mobile Experience

Responsive implementation is not mobile experience.

Responsive layout ensures a product is usable on a small screen. Mobile Experience Design ensures it feels like a premium product on the device most users actually use — which, for many HubZero products, is a phone, not a desktop.

Desktop and mobile share one design system and are equally important expressions of it. Neither is the reduced version of the other. This applies to a marketing site, a SaaS dashboard rendered in a mobile browser, and a native mobile application alike.

---

# Responsive Layout vs. Mobile Experience Design

Responsive layout is an engineering property: content reflows, targets remain tappable, nothing breaks.

Mobile Experience Design is a design property: composition, imagery, and typography are deliberately recomposed for a handheld, single-column, thumb-driven context.

A product can satisfy the first and completely fail the second. Passing responsive QA is not the same as passing Mobile Experience Design. This is why Mobile Experience is its own pass in `.hubzero/agents/design-review.md`, not a checkbox inside general review.

---

# Composition May Change

Desktop composition should not simply collapse into a single column.

Architecture — the sections, screens, or views that exist and the order they appear in — stays identical between desktop and mobile. Composition — how each is built — may change. A three-column feature grid on desktop might become a single deliberately-paced vertical sequence on mobile, not three stacked columns. A dashboard's multi-panel desktop layout might become a focused, swipeable single-panel view on mobile rather than a shrunken version of the same grid.

---

# Mobile Storytelling and Imagery

Where a product uses photography or illustration, treat it as a storytelling element on mobile, not a compressed desktop asset.

Prefer taller, more immersive compositions over simply shrinking desktop crops. Consider narrative sequencing — the order images appear as a user scrolls should build a story, the way a desktop grid builds an overview.

---

# Mobile Typography

Scaling font size down is not sufficient.

Review line length, paragraph width, and vertical rhythm specifically at mobile widths. Text that reads comfortably at a desktop's line length can become fatiguing at a phone's. Reading comfort at arm's length, one-handed, is a different problem than reading comfort at a desk.

---

# Touch Ergonomics

Design for the thumb, not the cursor.

A cursor can reach anywhere on screen with equal effort. A thumb cannot — reach is easiest near the bottom center of the screen and hardest near the top corners, and it changes further depending on one-handed or two-handed grip. Placing a product's most frequent action in the hardest-to-reach zone because that is where the desktop equivalent lives is a mobile experience failure even when the layout is fully responsive.

- Place primary, frequent actions within comfortable thumb reach; reserve harder-to-reach zones for secondary or infrequent actions.
- Treat touch as the primary input, not a substitute for a cursor. Never rely on hover to reveal information or controls a touch user has no way to trigger.
- Make gesture-based interactions (swipe, pull, long-press) discoverable through a visible affordance. A gesture with no visible cue is not an interaction a first-time user can find.
- See `.hubzero/design/navigation.md` for how primary navigation specifically should be positioned for one-handed, thumb-driven use on handheld devices.

---

# Component Recomposition

Review every recurring component for handheld composition intentionally, rather than assuming a shared responsive breakpoint solved it:

- Cards and list items
- Tables and data grids
- Forms
- Statistics, charts, and dashboards
- Navigation and menus
- Empty, loading, and error states
- Footers

Each of these was likely designed desktop-first. Confirm each still communicates its hierarchy clearly, and still feels considered, at mobile width and under touch input.

---

# Guiding Principle

A user who only ever experiences a HubZero product on their phone should have no sense that it was designed for a larger screen first.
