import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useState } from "react";
import { cn } from "~shared/lib/utils";

import { isBookmarkItemDragData } from "../lib/bookmark-dnd";

type FolderStartDropZoneProps = {
  folderId: string;
};

export function FolderStartDropZone({ folderId }: FolderStartDropZoneProps) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [isDropTarget, setIsDropTarget] = useState(false);

  useEffect(() => {
    if (!element) {
      return;
    }

    return dropTargetForElements({
      element,
      canDrop: ({ source }) => isBookmarkItemDragData(source.data),
      getData: () => ({ kind: "item-start", parentId: folderId }),
      onDragEnter: () => setIsDropTarget(true),
      onDragLeave: () => setIsDropTarget(false),
      onDrop: () => setIsDropTarget(false),
    });
  }, [element, folderId]);

  return (
    <div
      aria-hidden="true"
      className={cn("relative -mb-3 h-3 opacity-0", isDropTarget && "opacity-100")}
      ref={setElement}
    >
      {isDropTarget ? (
        <div className="bg-primary pointer-events-none absolute top-1/2 right-0 left-0 h-[3px] -translate-y-1/2 rounded-full shadow-sm" />
      ) : null}
    </div>
  );
}
