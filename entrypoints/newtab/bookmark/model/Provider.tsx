import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import type { BookmarkFolder, BookmarkIconDisplayMode, InlineEditingBookmark } from "./types";
import { useEditor } from "./useEditor";

export type BookmarkContextValue = {
  activeBookmark: InlineEditingBookmark | null;
  folders: BookmarkFolder[];
  editor: ReturnType<typeof useEditor>;
  onBookmarksChange: () => Promise<void>;
  isSearchActive: boolean;
  isEditMode: boolean;
  setActiveBookmark: (bookmark: InlineEditingBookmark | null) => void;
  bookmarkIconMode: BookmarkIconDisplayMode;
  folderDisplays?: import("../../settings/bookmark/model/settings").BookmarkSettings["folderDisplays"];
  folderViews: Record<string, "list" | "icons">;
  defaultView: "list" | "icons";
  visibleFolders: BookmarkFolder[];
};

type BookmarkProviderProps = {
  bookmarkIconMode: BookmarkIconDisplayMode;
  folderDisplays?: import("../../settings/bookmark/model/settings").BookmarkSettings["folderDisplays"];
  folderViews: Record<string, "list" | "icons">;
  defaultView: "list" | "icons";
  children: ReactNode;
  folders: BookmarkFolder[];
  isSearchActive: boolean;
  isEditMode: boolean;
  onBookmarksChange: () => Promise<void>;
  visibleFolders: BookmarkFolder[];
};

const BookmarkContext = createContext<BookmarkContextValue | null>(null);

export function BookmarkProvider({
  bookmarkIconMode,
  folderDisplays,
  folderViews,
  defaultView,
  children,
  folders,
  isSearchActive,
  isEditMode,
  onBookmarksChange,
  visibleFolders,
}: BookmarkProviderProps) {
  const editor = useEditor();
  const [activeBookmark, setActiveBookmark] = useState<InlineEditingBookmark | null>(null);

  const value = useMemo(
    () => ({
      activeBookmark,
      bookmarkIconMode,
      folderDisplays,
      folderViews,
      defaultView,
      folders,
      editor,
      onBookmarksChange,
      isSearchActive,
      isEditMode,
      setActiveBookmark,
      visibleFolders,
    }),
    [
      folderDisplays,
      folderViews,
      defaultView,
      activeBookmark,
      bookmarkIconMode,
      folders,
      editor,
      onBookmarksChange,
      isSearchActive,
      isEditMode,
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
