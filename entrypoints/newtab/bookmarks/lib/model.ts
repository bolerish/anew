export type BookmarkTreeNode = {
  children?: BookmarkTreeNode[];
  id: string;
  index?: number;
  parentId?: string;
  title: string;
  url?: string;
};

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

export type BookmarkSource = {
  id: string;
  title: string;
};

export type InlineEditingBookmark = { kind: "folder"; id: string } | { kind: "item"; id: string };

export type BookmarkIconDisplayMode = "dash" | "none" | "original" | "square";

export function isRootBookmarkFolder(folder: BookmarkFolder): boolean {
  return folder.parentId === "0";
}
