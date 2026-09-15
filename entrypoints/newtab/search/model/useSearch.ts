import { useState } from "react";
import { usePreferences } from "~shared/lib/preferences";

import type { BookmarkFolder } from "~/entrypoints/newtab/bookmark";

import { deriveVisibleBookmarkFolders } from "../lib/filter";
import { executeSearchQuery } from "../lib/navigation";

export function useSearch(folders: readonly BookmarkFolder[]) {
  const { engine } = usePreferences();
  const [query, setQuery] = useState("");
  const isActive = query.trim().length > 0;
  const visibleFolders = deriveVisibleBookmarkFolders(folders, query);

  function search() {
    return executeSearchQuery(query, engine);
  }

  return { isActive, query, search, setQuery, visibleFolders };
}
