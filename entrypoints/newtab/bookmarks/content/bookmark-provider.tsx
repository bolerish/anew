import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useSearch } from "~newtab/search/hooks/useSearch";

import type { BookmarkFolder, BookmarkIconDisplayMode, InlineEditingBookmark } from "../lib/model";
import { useBookmarkMovement } from "../movement/hooks/useBookmarkMovement";
import { useInlineTitle } from "./hooks/useInlineTitle";

export type BookmarkContextValue = {
  activeBookmark: InlineEditingBookmark | null;
  folders: BookmarkFolder[];
  inlineTitle: ReturnType<typeof useInlineTitle>;
  movement: ReturnType<typeof useBookmarkMovement>;
  onBookmarksChange: () => Promise<void>;
  rootBookmarkId: string | null;
  rootBookmarkTitle: string | null;
  searchIsActive: boolean;
  setActiveBookmark: (bookmark: InlineEditingBookmark | null) => void;
  bookmarkIconMode: BookmarkIconDisplayMode;
  visibleFolders: BookmarkFolder[];
};

type BookmarkProviderProps = {
  children: ReactNode;
  onBookmarksChange: () => Promise<void>;
  rootBookmarkId: string | null;
  rootBookmarkTitle: string | null;
  bookmarkIconMode: BookmarkIconDisplayMode;
};

const BookmarkContext = createContext<BookmarkContextValue | null>(null);

export function BookmarkProvider({
  children,
  bookmarkIconMode,
  onBookmarksChange,
  rootBookmarkId,
  rootBookmarkTitle,
}: BookmarkProviderProps) {
  const { folders, searchIsActive, visibleFolders } = useSearch();
  const inlineTitle = useInlineTitle();
  const movement = useBookmarkMovement({ folders, onBookmarksChange, searchIsActive });
  const [activeBookmark, setActiveBookmark] = useState<InlineEditingBookmark | null>(null);

  const value = useMemo(
    () => ({
      activeBookmark,
      bookmarkIconMode,
      folders,
      inlineTitle,
      movement,
      onBookmarksChange,
      rootBookmarkId,
      rootBookmarkTitle,
      searchIsActive,
      setActiveBookmark,
      visibleFolders,
    }),
    [
      activeBookmark,
      bookmarkIconMode,
      folders,
      inlineTitle,
      movement,
      onBookmarksChange,
      rootBookmarkId,
      rootBookmarkTitle,
      searchIsActive,
      visibleFolders,
    ],
  );

  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
}

export function useBookmarkContext(): BookmarkContextValue {
  const context = useContext(BookmarkContext);

  if (!context) {
    throw new Error("useBookmarkContext must be used within BookmarkProvider");
  }

  return context;
}
