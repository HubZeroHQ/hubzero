import type { JsonLd } from '@/lib/public/discovery/structured-data';

export function PublicJsonLd({
  values,
  enabled = true,
}: {
  values: readonly JsonLd[];
  enabled?: boolean;
}) {
  if (!enabled) return null;
  return values.map((value, index) => (
    <script
      key={index}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(value).replaceAll('<', '\\u003c') }}
    />
  ));
}
