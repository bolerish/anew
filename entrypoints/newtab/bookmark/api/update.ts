import { z } from "zod";

import { bookmarkUrlSchema } from "../lib/url";
import { performBookmarkCommand } from "../model/edit-session";
import { isRootBookmarkFolder, type BookmarkFolder, type BookmarkItem } from "../model/types";

export const bookmarkTitleSchema = z.string().trim().min(1);
export const updateItemSchema = z.object({ title: z.string(), url: bookmarkUrlSchema });

export async function updateTitle(bookmarkId: string, title: string): Promise<void> {
  await performBookmarkCommand({ type: "update", id: bookmarkId, input: { title: bookmarkTitleSchema.parse(title) } });
}

export async function updateItem(item: BookmarkItem, input: z.input<typeof updateItemSchema>): Promise<void> {
  const validated = updateItemSchema.parse(input);

  await performBookmarkCommand({
    type: "update",
    id: item.id,
    input: {
      title: validated.title,
      url: validated.url,
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
