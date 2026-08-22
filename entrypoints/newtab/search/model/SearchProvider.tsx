import { createContext, useCallback, useMemo, useState, type FormEvent, type ReactNode } from "react";

import type { BookmarkFolder } from "~/entrypoints/newtab/bookmark";

import { deriveVisibleBookmarkFolders } from "../lib/filter";
import { executeSearchQuery } from "../lib/navigation";

export type SearchContextValue = {
  folders: BookmarkFolder[];
  handleSearchSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  searchQuery: string;
  isSearchActive: boolean;
  setSearchQuery: (query: string) => void;
  visibleFolders: BookmarkFolder[];
};

type SearchProviderProps = {
  children: ReactNode;
  folders: BookmarkFolder[];
};

export const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children, folders }: SearchProviderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const isSearchActive = searchQuery.trim().length > 0;

  const visibleFolders = useMemo(
    () => deriveVisibleBookmarkFolders(folders, searchQuery),

    [folders, searchQuery],
  );

  const handleSearchSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      await executeSearchQuery({ folders, query: searchQuery });
    },
    [folders, searchQuery],
  );

  const value = useMemo(
    () => ({
      searchQuery,
      isSearchActive,
      setSearchQuery,
      handleSearchSubmit,
      folders,
      visibleFolders,
    }),

    [searchQuery, isSearchActive, handleSearchSubmit, folders, visibleFolders],
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}
