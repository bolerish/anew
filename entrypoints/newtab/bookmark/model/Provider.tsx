import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import type { BookmarkFolder, BookmarkIconDisplayMode, InlineEditingBookmark } from "./types";
import { useEditor } from "./useEditor";

export type BookmarkContextValue = {
  activeBookmark: InlineEditingBookmark | null;
  folders: BookmarkFolder[];
  editor: ReturnType<typeof useEditor>;
  onBookmarksChange: () => Promise<void>;
  isSearchActive: boolean;
  setActiveBookmark: (bookmark: InlineEditingBookmark | null) => void;
  bookmarkIconMode: BookmarkIconDisplayMode;
  visibleFolders: BookmarkFolder[];
};

type BookmarkProviderProps = {
  bookmarkIconMode: BookmarkIconDisplayMode;
  children: ReactNode;
  folders: BookmarkFolder[];
  isSearchActive: boolean;
  onBookmarksChange: () => Promise<void>;
  visibleFolders: BookmarkFolder[];
};

const BookmarkContext = createContext<BookmarkContextValue | null>(null);

export function BookmarkProvider({
  bookmarkIconMode,
  children,
  folders,
  isSearchActive,
  onBookmarksChange,
  visibleFolders,
}: BookmarkProviderProps) {
  const editor = useEditor();
  const [activeBookmark, setActiveBookmark] = useState<InlineEditingBookmark | null>(null);

  const value = useMemo(
    () => ({
      activeBookmark,
      bookmarkIconMode,
      folders,
      editor,
      onBookmarksChange,
      isSearchActive,
      setActiveBookmark,
      visibleFolders,
    }),
    [activeBookmark, bookmarkIconMode, folders, editor, onBookmarksChange, isSearchActive, visibleFolders],
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
