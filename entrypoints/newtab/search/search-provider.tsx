import { createContext, useCallback, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { BookmarkFolder } from "~newtab/bookmarks/lib/model";

import { deriveVisibleBookmarkFolders } from "./lib/filter";
import { executeSearchQuery } from "./lib/navigation";

export type SearchContextValue = {
  folders: BookmarkFolder[];
  handleSearchSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  searchQuery: string;
  searchIsActive: boolean;
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
  const searchIsActive = searchQuery.trim().length > 0;

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
      searchIsActive,
      setSearchQuery,
      handleSearchSubmit,
      folders,
      visibleFolders,
    }),

    [searchQuery, searchIsActive, handleSearchSubmit, folders, visibleFolders],
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}
