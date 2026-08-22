import { browser } from "wxt/browser";

import { normalizeUrl } from "../lib/bookmark-url";
import { isRootBookmarkFolder, type BookmarkFolder, type BookmarkItem } from "../model/bookmark-model";

export async function updateBookmarkTitle(bookmarkId: string, title: string): Promise<void> {
  await browser.bookmarks.update(bookmarkId, { title });
}

export async function updateBookmarkItem(item: BookmarkItem, input: { title: string; url: string }): Promise<void> {
  const normalizedUrl = normalizeUrl(input.url);

  await browser.bookmarks.update(item.id, {
    title: input.title,
    url: normalizedUrl,
  });
}

export async function deleteBookmarkFolder(folder: BookmarkFolder): Promise<void> {
  if (isRootBookmarkFolder(folder)) {
    return;
  }

  await browser.bookmarks.removeTree(folder.id);
}

export async function deleteBookmarkItem(item: BookmarkItem): Promise<void> {
  await browser.bookmarks.remove(item.id);
}
