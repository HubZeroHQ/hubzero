'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/** Route changes announce their destination and move focus to the new main landmark. */
export function PublicRouteEffects() {
  const pathname = usePathname();
  const firstRender = useRef(true);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const main = document.getElementById('main-content');
    main?.focus({ preventScroll: true });
    setAnnouncement(document.title);
  }, [pathname]);

  return (
    <p className="sr-only" aria-live="polite" aria-atomic="true">
      {announcement}
    </p>
  );
}
