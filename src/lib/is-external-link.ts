/**
 * Shared by Link and Button (href variant) so "which tag, which attributes"
 * is decided in exactly one place instead of duplicated per component.
 */
export function isExternalHref(href: string): boolean {
  return /^([a-z][a-z0-9+.-]*:|\/\/)/i.test(href);
}
