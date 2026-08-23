import { useState } from "react";

import type { BookmarkFolder } from "~/entrypoints/newtab/bookmark";

import { deriveVisibleBookmarkFolders } from "../lib/filter";
import { executeSearchQuery } from "../lib/navigation";

export function useSearch(folders: readonly BookmarkFolder[]) {
  const [query, setQuery] = useState("");
  const isActive = query.trim().length > 0;
  const visibleFolders = deriveVisibleBookmarkFolders(folders, query);

  function search() {
    return executeSearchQuery({ folders, query });
  }

  return { isActive, query, search, setQuery, visibleFolders };
}
