import type { ComponentPropsWithoutRef } from "react";

/**
 * The trace-geometry icon foundation (DESIGN/V3/02_VISUAL_LANGUAGE.md §12,
 * 14_VISUAL_TOKENS.md §6) — HubZero's own minimal icon vocabulary instead
 * of a third-party icon library with its own unrelated visual DNA.
 *
 * Construction rule, every icon: 24×24 grid, 1.5px stroke (matching
 * `--stroke-diagram`), right angles and 45° diagonals only — no curves, no
 * circles as primitives (a status dot is a square/diamond, never a
 * circle). The magnifier's lens is squared for the same reason. `warning`'s
 * triangle is the one acknowledged exception (§6's own severity-convention
 * shapes), since a hazard triangle is a real, recognized schematic
 * convention in its own right, not an arbitrary curve.
 *
 * Every icon here is presentation-only (`aria-hidden`, no built-in
 * accessible name) — matching how the existing lucide-react icons are
 * consumed in this codebase (e.g. `<IconButton icon={<X />} aria-label=. />`).
 * The required accessible name for each is documented per-component below;
 * supply it on the interactive control that wraps the icon, not the icon.
 */

export type IconProps = Omit<ComponentPropsWithoutRef<"svg">, "children">;

function IconBase({ children, ...props }: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      className="size-4"
      {...props}
    >
      {children}
    </svg>
  );
}

/** Accessible name when interactive: "Open menu". */
export function MenuIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </IconBase>
  );
}

/** Accessible name when interactive: "Close". */
export function CloseIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </IconBase>
  );
}

/**
 * Two 45° traces meeting at a right angle — never a curved arrowhead.
 * Accessible name when interactive: "Expand" / "Collapse" (contextual).
 * @param direction Which way the chevron points. @default "down"
 */
export function ChevronIcon({
  direction = "down",
  ...props
}: IconProps & { direction?: "up" | "down" | "left" | "right" }) {
  const rotation = { down: 0, up: 180, left: 90, right: -90 }[direction];
  return (
    <IconBase {...props}>
      <polyline points="6,9 12,15 18,9" transform={`rotate(${rotation} 12 12)`} />
    </IconBase>
  );
}

/** Accessible name when interactive: "Opens in a new tab". */
export function ExternalLinkIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="4" y="8" width="12" height="12" />
      <polyline points="14,10 20,4" />
      <polyline points="15,4 20,4 20,9" />
    </IconBase>
  );
}

/**
 * Squared magnifier lens — the one deliberate departure from the literal
 * "no circles" rule, resolved by squaring the lens itself rather than
 * introducing a curve. Accessible name when interactive: "Search".
 */
export function SearchIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="4" y="4" width="10" height="10" />
      <line x1="14" y1="14" x2="20" y2="20" />
    </IconBase>
  );
}

/**
 * Three traces of decreasing length with a square node on each — rhymes
 * with the timeline-node convention (06_COMPONENT_LANGUAGE.md §12).
 * Accessible name when interactive: "Filter results".
 */
export function FilterIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="15" y2="12" />
      <line x1="4" y1="18" x2="10" y2="18" />
      <rect x="18.25" y="4.25" width="3.5" height="3.5" fill="currentColor" stroke="none" />
      <rect x="13.25" y="10.25" width="3.5" height="3.5" fill="currentColor" stroke="none" />
      <rect x="8.25" y="16.25" width="3.5" height="3.5" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

/**
 * A filled square node — the same primitive a diagram junction or a
 * timeline milestone uses (06_COMPONENT_LANGUAGE.md §12), reinforcing that
 * a status dot and a diagram node are the same kind of object here.
 * Accessible name: always a contextual live-status label (e.g. "Live demo
 * available") — never a bare icon with no name.
 */
export function StatusIndicatorIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="8" y="8" width="8" height="8" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

/** Accessible name when interactive: "Copy to clipboard". */
export function CopyIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="4" y="4" width="12" height="12" />
      <rect x="8" y="8" width="12" height="12" />
    </IconBase>
  );
}

/** Paired with the "Success" text label per 12_ACCESSIBILITY.md §2/§5 — never color/shape alone. */
export function SuccessIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="6" y="6" width="12" height="12" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

/** Paired with the "Error" text label per 12_ACCESSIBILITY.md §2/§5 — never color/shape alone. */
export function ErrorIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect
        x="7.76"
        y="7.76"
        width="8.49"
        height="8.49"
        transform="rotate(45 12 12)"
        fill="currentColor"
        stroke="none"
      />
    </IconBase>
  );
}

/**
 * The one acknowledged exception to the right-angle/45°-only rule — a
 * hazard triangle is a real, recognized schematic severity convention in
 * its own right (14_VISUAL_TOKENS.md §6), not an arbitrary curve. Paired
 * with the "Warning" text label per 12_ACCESSIBILITY.md §2/§5.
 */
export function WarningIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <polygon points="12,5 20,19 4,19" fill="currentColor" stroke="none" />
    </IconBase>
  );
}
