/**
 * Off-screen until focused, so keyboard/screen-reader users can bypass the
 * Navbar without a visible-to-everyone "skip" link cluttering the header —
 * ARCHITECTURE/07_DESIGN_SYSTEM.md §6 baseline accessibility requirement.
 * Pair with `id="main-content"` on the page's <main> landmark.
 */
export function SkipNav() {
  return (
    <a
      href="#main-content"
      className="bg-accent text-accent-foreground z-toast fixed top-4 left-4 -translate-y-24 rounded-md px-4 py-2 font-medium transition-transform duration-150 focus:translate-y-0"
    >
      Skip to content
    </a>
  );
}
