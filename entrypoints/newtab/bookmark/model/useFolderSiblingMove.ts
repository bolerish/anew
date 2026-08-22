import { updateBookmarkFolderParentIndex } from "../api/move-bookmark";
import {
  computeNextInsertIndex,
  computePreviousInsertIndex,
  resolveNextSibling,
  resolvePreviousSibling,
} from "../lib/bookmark-sibling";
import { useBookmarkContext } from "../ui/BookmarkProvider";
import type { BookmarkFolder } from "./bookmark-model";

export function useFolderSiblingMove(folder: BookmarkFolder) {
  const { folders, onBookmarksChange, isSearchActive } = useBookmarkContext();
  const siblingFolders = folders.filter((candidate) => candidate.parentId === folder.parentId);
  const folderIndex = siblingFolders.findIndex((candidate) => candidate.id === folder.id);
  const previousFolder = isSearchActive ? null : resolvePreviousSibling(siblingFolders, folderIndex);
  const nextFolder = isSearchActive ? null : resolveNextSibling(siblingFolders, folderIndex);

  function moveFolderUp() {
    if (!previousFolder || !folder.parentId) {
      return;
    }

    void updateBookmarkFolderParentIndex(folder, {
      insertIndex: computePreviousInsertIndex(previousFolder),
      parentId: folder.parentId,
    }).then(onBookmarksChange);
  }

  function moveFolderDown() {
    if (!nextFolder || !folder.parentId) {
      return;
    }

    void updateBookmarkFolderParentIndex(folder, {
      insertIndex: computeNextInsertIndex(nextFolder, folderIndex),
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
