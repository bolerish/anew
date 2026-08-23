import { browser } from "wxt/browser";

import { isRootBookmarkFolder, type BookmarkFolder, type BookmarkItem } from "../model/types";

type MoveTarget = {
  index?: number;
  parentId: string;
};

export async function moveItem(item: BookmarkItem, target: MoveTarget): Promise<void> {
  await browser.bookmarks.move(item.id, target);
}

export async function moveFolder(folder: BookmarkFolder, target: MoveTarget): Promise<void> {
  if (isRootBookmarkFolder(folder)) {
    return;
  }

  await browser.bookmarks.move(folder.id, target);
}
