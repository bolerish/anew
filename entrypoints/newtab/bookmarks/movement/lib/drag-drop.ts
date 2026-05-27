import type { BookmarkFolder, BookmarkItem } from "../../lib/model";

export type BookmarkDragData = { kind: "folder"; folder: BookmarkFolder } | { kind: "item"; item: BookmarkItem };

export type BookmarkDropData =
  | { kind: "folder"; folder: BookmarkFolder }
  | { kind: "item"; item: BookmarkItem }
  | { kind: "item-start"; parentId: string };

export function computeBookmarkInsertIndex(folders: BookmarkFolder[], targetItem: BookmarkItem): number {
  const targetFolder = folders.find((folder) => folder.items.some((item) => item.id === targetItem.id));

  if (!targetFolder) {
    return targetItem.bookmarkIndex ?? 0;
  }

  const targetIndex = targetItem.bookmarkIndex ?? targetFolder.items.findIndex((item) => item.id === targetItem.id);

  return Math.max(0, targetIndex);
}

export function computeFolderInsertIndex(targetFolder: BookmarkFolder): number {
  const targetIndex = targetFolder.bookmarkIndex ?? 0;

  return Math.max(0, targetIndex);
}
