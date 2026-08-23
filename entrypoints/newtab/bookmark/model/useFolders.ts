import { useMemo } from "react";

import { deriveLocations, deriveVisibleFolders } from "../lib/tree";
import type { BookmarkFolder, BookmarkLocation } from "./types";
import { useLocation } from "./useLocation";
import { useTree } from "./useTree";

type FoldersState = {
  folders: BookmarkFolder[];
  loadBookmarks: () => Promise<void>;
  locations: BookmarkLocation[];
  selectedLocationId: string | null;
  setSelectedLocation: (locationId: string) => void;
};

export function useFolders(): FoldersState {
  const { bookmarkTree, loadBookmarks } = useTree();
  const locations = useMemo(() => deriveLocations(bookmarkTree), [bookmarkTree]);
  const { selectedLocationId, setSelectedLocation } = useLocation(locations);
  const folders = useMemo(
    () => deriveVisibleFolders(bookmarkTree, selectedLocationId),
    [bookmarkTree, selectedLocationId],
  );

  return {
    folders,
    loadBookmarks,
    locations,
    selectedLocationId,
    setSelectedLocation,
  };
}
