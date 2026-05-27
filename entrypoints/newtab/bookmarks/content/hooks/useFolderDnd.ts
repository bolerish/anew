import { useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";

import type { BookmarkFolder } from "../../lib/model";
import type { BookmarkDragData } from "../../movement/lib/drag-drop";
import { useBookmarkContext } from "../bookmark-provider";

export function useFolderDnd(folder: BookmarkFolder) {
  const { visibleFolders } = useBookmarkContext();
  const siblingFolders = visibleFolders.filter((candidate) => candidate.parentId === folder.parentId);
  const folderIndex = siblingFolders.findIndex((candidate) => candidate.id === folder.id);
  const folderDrop = useDroppable<BookmarkDragData>({
    accept: ["item"],
    data: { kind: "folder", folder },
    id: `folder-drop:${folder.id}`,
    type: "folder",
  });
  const folderSort = useSortable<BookmarkDragData>({
    accept: ["folder"],
    data: { kind: "folder", folder },
    group: folder.parentId ?? "bookmark-root",
    id: `folder:${folder.id}`,
    index: Math.max(0, folderIndex),
    type: "folder",
  });

  return {
    folderDrop,
    folderSort,
  };
}
