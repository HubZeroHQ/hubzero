"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/lib/use-debounced-value";

export interface SearchBoxProps {
  initialQuery: string;
}

/** The public `/search` page's input — URL-driven exactly like `use-cms-table.ts`'s Studio tables, so a bookmarked/shared search URL reproduces the same results. Autofocuses so arriving via the Cmd/Ctrl+K shortcut (`search-trigger.tsx`) lands the cursor ready to type. */
export function SearchBox({ initialQuery }: SearchBoxProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const debounced = useDebouncedValue(value, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debounced.trim()) params.set("q", debounced.trim());
    const query = params.toString();
    router.replace(query ? `/search?${query}` : "/search");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className="relative">
      <Search
        className="text-text-muted pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2"
        aria-hidden="true"
      />
      <Input
        ref={inputRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search case studies, blueprints, labs, notes, team…"
        aria-label="Search"
        className="text-body w-full py-3 pl-12"
      />
    </div>
  );
}
