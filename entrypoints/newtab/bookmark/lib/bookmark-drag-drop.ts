import type { BookmarkFolder, BookmarkItem } from "../model/bookmark-model";

export type BookmarkDropEdge = "after" | "before";

export type BookmarkDragData = { kind: "folder"; folder: BookmarkFolder } | { kind: "item"; item: BookmarkItem };

export type BookmarkDropData =
  | { edge?: BookmarkDropEdge; kind: "folder"; folder: BookmarkFolder }
  | { edge?: BookmarkDropEdge; kind: "item"; item: BookmarkItem }
  | { kind: "item-start"; parentId: string };

export function computeBookmarkInsertIndex(
  folders: readonly BookmarkFolder[],
  targetItem: BookmarkItem,
  edge: BookmarkDropEdge = "before",
): number {
  const targetFolder = folders.find((folder) => folder.items.some((item) => item.id === targetItem.id));

  if (!targetFolder) {
    return edge === "after" ? (targetItem.bookmarkIndex ?? 0) + 1 : (targetItem.bookmarkIndex ?? 0);
  }

  const targetIndex = targetItem.bookmarkIndex ?? targetFolder.items.findIndex((item) => item.id === targetItem.id);

  return Math.max(0, edge === "after" ? targetIndex + 1 : targetIndex);
}

export function computeFolderInsertIndex(targetFolder: BookmarkFolder, edge: BookmarkDropEdge = "before"): number {
  const targetIndex = targetFolder.bookmarkIndex ?? 0;

  return Math.max(0, edge === "after" ? targetIndex + 1 : targetIndex);
}
