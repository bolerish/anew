import { browser } from "wxt/browser";

import { isRootBookmarkFolder, type BookmarkFolder, type BookmarkItem } from "../model/bookmark-model";

export async function updateBookmarkItemFolder(item: BookmarkItem, folder: BookmarkFolder): Promise<void> {
  await browser.bookmarks.move(item.id, {
    parentId: folder.id,
  });
}

export async function updateBookmarkItemParentIndex(
  item: BookmarkItem,
  input: { insertIndex: number; parentId: string },
): Promise<void> {
  await browser.bookmarks.move(item.id, {
    index: input.insertIndex,
    parentId: input.parentId,
  });
}

export async function updateBookmarkItemBeforeTarget(
  item: BookmarkItem,
  targetItem: BookmarkItem,
  insertIndex: number,
): Promise<void> {
  await browser.bookmarks.move(item.id, {
    parentId: targetItem.parentId,
    index: insertIndex,
  });
}

export async function updateBookmarkFolderParentIndex(
  folder: BookmarkFolder,
  input: { insertIndex: number; parentId: string },
): Promise<void> {
  if (isRootBookmarkFolder(folder)) {
    return;
  }

  await browser.bookmarks.move(folder.id, {
    index: input.insertIndex,
    parentId: input.parentId,
  });
}

export async function updateBookmarkFolderBeforeTarget(
  folder: BookmarkFolder,
  targetFolder: BookmarkFolder,
  insertIndex: number,
): Promise<void> {
  if (isRootBookmarkFolder(folder)) {
    return;
  }

  if (!targetFolder.parentId) {
    return;
  }

  await browser.bookmarks.move(folder.id, {
    parentId: targetFolder.parentId,
    index: insertIndex,
  });
}
