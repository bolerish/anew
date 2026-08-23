import { useCallback, useMemo, useState } from "react";

import type { BookmarkFolder } from "~/entrypoints/newtab/bookmark";

import { deriveVisibleBookmarkFolders } from "../lib/filter";
import { executeSearchQuery } from "../lib/navigation";

export function useSearch(folders: readonly BookmarkFolder[]) {
  const [query, setQuery] = useState("");
  const isActive = query.trim().length > 0;
  const visibleFolders = useMemo(() => deriveVisibleBookmarkFolders(folders, query), [folders, query]);
  const search = useCallback(() => executeSearchQuery({ folders, query }), [folders, query]);

  return { isActive, query, search, setQuery, visibleFolders };
}
