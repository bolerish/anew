import { updateBookmarkItemParentIndex } from "../api/move-bookmark";
import {
  computeNextInsertIndex,
  computePreviousInsertIndex,
  resolveNextSibling,
  resolvePreviousSibling,
} from "../lib/bookmark-sibling";
import { useBookmarkContext } from "../ui/BookmarkProvider";
import type { BookmarkItem } from "./bookmark-model";

export function useItemSiblingMove(item: BookmarkItem) {
  const { folders, onBookmarksChange, isSearchActive } = useBookmarkContext();
  const parentFolder = folders.find((folder) => folder.id === item.parentId);
  const siblingItems = parentFolder?.items ?? [];
  const sourceItemIndex = siblingItems.findIndex((candidate) => candidate.id === item.id);
  const previousItem = isSearchActive ? null : resolvePreviousSibling(siblingItems, sourceItemIndex);
  const nextItem = isSearchActive ? null : resolveNextSibling(siblingItems, sourceItemIndex);

  function moveItemUp() {
    if (!previousItem) {
      return;
    }

    void updateBookmarkItemParentIndex(item, {
      insertIndex: computePreviousInsertIndex(previousItem),
      parentId: item.parentId,
    }).then(onBookmarksChange);
  }

  function moveItemDown() {
    if (!nextItem) {
      return;
    }

    void updateBookmarkItemParentIndex(item, {
      insertIndex: computeNextInsertIndex(nextItem, sourceItemIndex),
      parentId: item.parentId,
    }).then(onBookmarksChange);
  }

  return {
    moveItemDown,
    moveItemUp,
    nextItem,
    previousItem,
  };
}
