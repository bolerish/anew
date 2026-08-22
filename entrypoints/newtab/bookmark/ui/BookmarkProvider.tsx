import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useSearch } from "~newtab/search";

import type { BookmarkFolder, BookmarkIconDisplayMode, InlineEditingBookmark } from "../model/bookmark-model";
import { useBookmarkMovement } from "../model/useBookmarkMovement";
import { useInlineBookmarkEditor } from "../model/useInlineBookmarkEditor";

export type BookmarkContextValue = {
  activeBookmark: InlineEditingBookmark | null;
  folders: BookmarkFolder[];
  inlineEditor: ReturnType<typeof useInlineBookmarkEditor>;
  movement: ReturnType<typeof useBookmarkMovement>;
  onBookmarksChange: () => Promise<void>;
  rootBookmarkId: string | null;
  rootBookmarkTitle: string | null;
  isSearchActive: boolean;
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
  const { folders, isSearchActive, visibleFolders } = useSearch();
  const inlineEditor = useInlineBookmarkEditor();
  const movement = useBookmarkMovement({ folders, onBookmarksChange, isSearchActive });
  const [activeBookmark, setActiveBookmark] = useState<InlineEditingBookmark | null>(null);

  const value = useMemo(
    () => ({
      activeBookmark,
      bookmarkIconMode,
      folders,
      inlineEditor,
      movement,
      onBookmarksChange,
      rootBookmarkId,
      rootBookmarkTitle,
      isSearchActive,
      setActiveBookmark,
      visibleFolders,
    }),
    [
      activeBookmark,
      bookmarkIconMode,
      folders,
      inlineEditor,
      movement,
      onBookmarksChange,
      rootBookmarkId,
      rootBookmarkTitle,
      isSearchActive,
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
