import { useCallback } from "react";

import type { BookmarkItem } from "../../lib/model";
import { updateBookmarkItemParentIndex } from "../../movement/lib/mutation";
import {
  computeNextInsertIndex,
  computePreviousInsertIndex,
  resolveNextSibling,
  resolvePreviousSibling,
} from "../../movement/lib/sibling-move";
import { useBookmarkContext } from "../bookmark-provider";

export function useItemSiblingMove(item: BookmarkItem) {
  const { folders, onBookmarksChange, searchIsActive } = useBookmarkContext();
  const parentFolder = folders.find((folder) => folder.id === item.parentId);
  const siblingItems = parentFolder?.items ?? [];
  const sourceItemIndex = siblingItems.findIndex((candidate) => candidate.id === item.id);
  const previousItem = searchIsActive ? null : resolvePreviousSibling(siblingItems, sourceItemIndex);
  const nextItem = searchIsActive ? null : resolveNextSibling(siblingItems, sourceItemIndex);

  const moveItemUp = useCallback(() => {
    if (!previousItem) {
      return;
    }

    void updateBookmarkItemParentIndex(item, {
      insertIndex: computePreviousInsertIndex(previousItem),
      parentId: item.parentId,
    }).then(onBookmarksChange);
  }, [item, onBookmarksChange, previousItem]);

  const moveItemDown = useCallback(() => {
    if (!nextItem) {
      return;
    }

    void updateBookmarkItemParentIndex(item, {
      insertIndex: computeNextInsertIndex(nextItem, sourceItemIndex),
      parentId: item.parentId,
    }).then(onBookmarksChange);
  }, [item, nextItem, onBookmarksChange, sourceItemIndex]);

  return {
    moveItemDown,
    moveItemUp,
    nextItem,
    previousItem,
  };
}
