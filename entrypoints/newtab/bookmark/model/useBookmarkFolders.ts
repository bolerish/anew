import { useMemo } from "react";

import { deriveLocations, deriveVisibleFolders } from "../lib/bookmark-tree";
import type { BookmarkFolder, BookmarkLocation } from "./bookmark-model";
import { useBookmarkTree } from "./useBookmarkTree";
import { useSelectedLocation } from "./useSelectedLocation";

type FoldersState = {
  folders: BookmarkFolder[];
  loadBookmarks: () => Promise<void>;
  locations: BookmarkLocation[];
  selectedLocationId: string | null;
  selectedLocationTitle: string | null;
  setSelectedLocation: (locationId: string) => void;
};

export function useFolders(): FoldersState {
  const { bookmarkTree, loadBookmarks } = useBookmarkTree();
  const locations = useMemo(() => deriveLocations(bookmarkTree), [bookmarkTree]);
  const { selectedLocationId, selectedLocationTitle, setSelectedLocation } = useSelectedLocation(locations);
  const folders = useMemo(
    () => deriveVisibleFolders(bookmarkTree, selectedLocationId),
    [bookmarkTree, selectedLocationId],
  );

  return {
    folders,
    loadBookmarks,
    locations,
    selectedLocationId,
    selectedLocationTitle,
    setSelectedLocation,
  };
}
