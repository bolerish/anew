import { z } from "zod";
export type BookmarkTreeNode = {
  children?: BookmarkTreeNode[];
  id: string;
  index?: number;
  parentId?: string;
  title: string;
  url?: string;
};

export const ROOT_BOOKMARK_ID = "0";

export const bookmarkItemSchema = z.object({
  bookmarkIndex: z.number().int().nonnegative().optional(),
  id: z.string().min(1),
  parentId: z.string().min(1),
  title: z.string(),
  url: z.string(),
});
export const bookmarkFolderSchema = z.object({
  bookmarkIndex: z.number().int().nonnegative().optional(),
  displayTitle: z.string(),
  id: z.string().min(1),
  parentId: z.string().optional(),
  title: z.string(),
  items: z.array(bookmarkItemSchema),
});
export type BookmarkItem = z.output<typeof bookmarkItemSchema>;
export type BookmarkFolder = z.output<typeof bookmarkFolderSchema>;

export type BookmarkLocation = {
  depth: number;
  id: string;
  rootTitle: string;
  title: string;
};

export type InlineEditingBookmark = { kind: "folder"; id: string } | { kind: "item"; id: string };

export function isRootBookmarkFolder(folder: BookmarkFolder): boolean {
  return folder.parentId === ROOT_BOOKMARK_ID;
}
import type { BookmarkIconDisplayMode } from "~shared/config/appearance";

export type { BookmarkIconDisplayMode };
