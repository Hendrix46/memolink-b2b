/**
 * Build a public, shareable delivery-gallery link from a `shareToken`
 * (changelog §7). The public consumer surface lives on the gallery host;
 * the dashboard only needs a copyable URL pointing at it.
 */
export function buildShareLink(shareToken: string): string {
  return `https://gallery.memolink.app/${shareToken}`;
}
