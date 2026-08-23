import { moveItem } from "../api/move";
import {
  computeNextInsertIndex,
  computePreviousInsertIndex,
  resolveNextSibling,
  resolvePreviousSibling,
} from "../lib/sibling";
import { useBookmarkContext } from "./Provider";
import type { BookmarkItem } from "./types";

export function useItemMove(item: BookmarkItem) {
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

    void moveItem(item, {
      index: computePreviousInsertIndex(previousItem),
      parentId: item.parentId,
    }).then(onBookmarksChange);
  }

  function moveItemDown() {
    if (!nextItem) {
      return;
    }

    void moveItem(item, {
      index: computeNextInsertIndex(nextItem, sourceItemIndex),
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
