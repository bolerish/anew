import { moveFolder } from "../api/move";
import {
  computeNextInsertIndex,
  computePreviousInsertIndex,
  resolveNextSibling,
  resolvePreviousSibling,
} from "../lib/sibling";
import { useBookmarkContext } from "./Provider";
import type { BookmarkFolder } from "./types";

export function useFolderMove(folder: BookmarkFolder) {
  const { folders, onBookmarksChange, isSearchActive } = useBookmarkContext();
  const siblingFolders = folders.filter((candidate) => candidate.parentId === folder.parentId);
  const folderIndex = siblingFolders.findIndex((candidate) => candidate.id === folder.id);
  const previousFolder = isSearchActive ? null : resolvePreviousSibling(siblingFolders, folderIndex);
  const nextFolder = isSearchActive ? null : resolveNextSibling(siblingFolders, folderIndex);

  function moveFolderUp() {
    if (!previousFolder || !folder.parentId) {
      return;
    }

    void moveFolder(folder, {
      index: computePreviousInsertIndex(previousFolder),
      parentId: folder.parentId,
    }).then(onBookmarksChange);
  }

  function moveFolderDown() {
    if (!nextFolder || !folder.parentId) {
      return;
    }

    void moveFolder(folder, {
      index: computeNextInsertIndex(nextFolder, folderIndex),
      parentId: folder.parentId,
    }).then(onBookmarksChange);
  }

  return {
    folderIndex,
    moveFolderDown,
    moveFolderUp,
    nextFolder,
    previousFolder,
  };
}
