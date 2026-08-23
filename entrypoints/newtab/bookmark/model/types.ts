export type BookmarkTreeNode = {
  children?: BookmarkTreeNode[];
  id: string;
  index?: number;
  parentId?: string;
  title: string;
  url?: string;
};

export const ROOT_BOOKMARK_ID = "0";

export type BookmarkItem = {
  bookmarkIndex?: number;
  id: string;
  parentId: string;
  title: string;
  url: string;
};

export type BookmarkFolder = {
  bookmarkIndex?: number;
  displayTitle: string;
  id: string;
  parentId?: string;
  title: string;
  items: BookmarkItem[];
};

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
