import { useDroppable } from "@dnd-kit/react";
import { cn } from "~newtab/shared/lib/utils";

import type { BookmarkDropData } from "../../movement/lib/drag-drop";

type FolderStartDropZoneProps = {
  folderId: string;
};

export function FolderStartDropZone({ folderId }: FolderStartDropZoneProps) {
  const drop = useDroppable<BookmarkDropData>({
    accept: ["item"],
    data: { kind: "item-start", parentId: folderId },
    id: `item-start:${folderId}`,
    type: "item-start",
  });

  return (
    <div
      aria-hidden="true"
      className={cn("-mb-3 h-3 opacity-0", drop.isDropTarget && "bg-accent opacity-100")}
      ref={drop.ref}
    />
  );
}
