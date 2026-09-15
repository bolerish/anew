import { normalizeUrl } from "../lib/url";
import { performBookmarkCommand } from "../model/edit-session";
import { isRootBookmarkFolder, type BookmarkFolder, type BookmarkItem } from "../model/types";

export async function updateTitle(bookmarkId: string, title: string): Promise<void> {
  await performBookmarkCommand({ type: "update", id: bookmarkId, input: { title } });
}

export async function updateItem(item: BookmarkItem, input: { title: string; url: string }): Promise<void> {
  const normalizedUrl = normalizeUrl(input.url);

  await performBookmarkCommand({
    type: "update",
    id: item.id,
    input: {
      title: input.title,
      url: normalizedUrl,
    },
  });
}

export async function deleteFolder(folder: BookmarkFolder): Promise<void> {
  if (isRootBookmarkFolder(folder)) {
    return;
  }

  await performBookmarkCommand({ type: "remove", id: folder.id, folder: true });
}

export async function deleteItem(item: BookmarkItem): Promise<void> {
  await performBookmarkCommand({ type: "remove", id: item.id, folder: false });
}
