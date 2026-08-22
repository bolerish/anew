import { useMemo } from "react";

import { deriveBookmarkFolders, deriveBookmarkSources } from "../lib/bookmark-tree";
import type { BookmarkFolder, BookmarkSource } from "./bookmark-model";
import { useBookmarkTree } from "./useBookmarkTree";
import { useSelectedBookmarkSource } from "./useSelectedBookmarkSource";

type FoldersState = {
  folders: BookmarkFolder[];
  loadBookmarks: () => Promise<void>;
  selectedSourceId: string | null;
  selectedSourceTitle: string | null;
  setSelectedSource: (sourceId: string) => void;
  sources: BookmarkSource[];
};

export function useFolders(): FoldersState {
  const { bookmarkTree, loadBookmarks } = useBookmarkTree();
  const sources = useMemo(() => deriveBookmarkSources(bookmarkTree), [bookmarkTree]);
  const { selectedSourceId, selectedSourceTitle, setSelectedSource } = useSelectedBookmarkSource(sources);
  const folders = useMemo(
    () => deriveBookmarkFolders(bookmarkTree, selectedSourceId),
    [bookmarkTree, selectedSourceId],
  );

  return {
    folders,
    loadBookmarks,
    selectedSourceId,
    selectedSourceTitle,
    setSelectedSource,
    sources,
  };
}
