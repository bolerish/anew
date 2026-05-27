import { useCallback } from "react";

import type { BookmarkFolder } from "../../lib/model";
import { updateBookmarkFolderParentIndex } from "../../movement/lib/mutation";
import {
  computeNextInsertIndex,
  computePreviousInsertIndex,
  resolveNextSibling,
  resolvePreviousSibling,
} from "../../movement/lib/sibling-move";
import { useBookmarkContext } from "../bookmark-provider";

export function useFolderSiblingMove(folder: BookmarkFolder) {
  const { folders, onBookmarksChange, searchIsActive } = useBookmarkContext();
  const siblingFolders = folders.filter((candidate) => candidate.parentId === folder.parentId);
  const folderIndex = siblingFolders.findIndex((candidate) => candidate.id === folder.id);
  const previousFolder = searchIsActive ? null : resolvePreviousSibling(siblingFolders, folderIndex);
  const nextFolder = searchIsActive ? null : resolveNextSibling(siblingFolders, folderIndex);

  const moveFolderUp = useCallback(() => {
    if (!previousFolder || !folder.parentId) {
      return;
    }

    void updateBookmarkFolderParentIndex(folder, {
      insertIndex: computePreviousInsertIndex(previousFolder),
      parentId: folder.parentId,
    }).then(onBookmarksChange);
  }, [folder, onBookmarksChange, previousFolder]);

  const moveFolderDown = useCallback(() => {
    if (!nextFolder || !folder.parentId) {
      return;
    }

    void updateBookmarkFolderParentIndex(folder, {
      insertIndex: computeNextInsertIndex(nextFolder, folderIndex),
      parentId: folder.parentId,
    }).then(onBookmarksChange);
  }, [folder, folderIndex, nextFolder, onBookmarksChange]);

  return {
    folderIndex,
    moveFolderDown,
    moveFolderUp,
    nextFolder,
    previousFolder,
  };
}
