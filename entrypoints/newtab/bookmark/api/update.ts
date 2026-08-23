import { browser } from "wxt/browser";

import { normalizeUrl } from "../lib/url";
import { isRootBookmarkFolder, type BookmarkFolder, type BookmarkItem } from "../model/types";

export async function updateTitle(bookmarkId: string, title: string): Promise<void> {
  await browser.bookmarks.update(bookmarkId, { title });
}

export async function updateItem(item: BookmarkItem, input: { title: string; url: string }): Promise<void> {
  const normalizedUrl = normalizeUrl(input.url);

  await browser.bookmarks.update(item.id, {
    title: input.title,
    url: normalizedUrl,
  });
}

export async function deleteFolder(folder: BookmarkFolder): Promise<void> {
  if (isRootBookmarkFolder(folder)) {
    return;
  }

  await browser.bookmarks.removeTree(folder.id);
}

export async function deleteItem(item: BookmarkItem): Promise<void> {
  await browser.bookmarks.remove(item.id);
}
