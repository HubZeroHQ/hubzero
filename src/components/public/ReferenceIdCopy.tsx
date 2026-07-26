'use client';

import { useState } from 'react';

/** A real copy action for a record's reference ID — previously plain, unselectable-feeling text in the detail footer and register. Falls back silently to the already-visible text if Clipboard API access is denied. */
export function ReferenceIdCopy({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied — the reference ID remains visible as plain text.
    }
  }

  return (
    <span className="reference-id-copy">
      <span>{value}</span>
      <button type="button" onClick={handleCopy}>
        {copied ? 'Copied' : 'Copy'}
        <span className="sr-only"> reference {value} to clipboard</span>
      </button>
    </span>
  );
}
