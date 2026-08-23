import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useState } from "react";
import { cn } from "~shared/lib/utils";

import { isItemDragData } from "../lib/dnd";
import { useBookmarkContext } from "../model/Provider";
import type { BookmarkFolder } from "../model/types";
import { useAddForm } from "../model/useAddForm";
import { useFolderDnd } from "../model/useFolderDnd";
import { AddForm } from "./AddForm";
import { DropIndicator } from "./DropIndicator";
import { FolderHeader } from "./FolderHeader";
import { Item } from "./Item";

type FolderProps = {
  folder: BookmarkFolder;
};

export function Folder({ folder }: FolderProps) {
  const { onBookmarksChange } = useBookmarkContext();
  const { drop, sort } = useFolderDnd(folder);
  const addForm = useAddForm({
    parentId: folder.id,
    onCreated: onBookmarksChange,
  });

  return (
    <section className={cn("relative grid", sort.isDragSource && "opacity-20")} ref={sort.ref}>
      {sort.isDropTarget && sort.dropEdge ? <DropIndicator edge={sort.dropEdge} placement="outside" /> : null}
      <FolderHeader
        folder={folder}
        handleRef={sort.handleRef}
        isDragging={sort.isDragSource}
        onAddItem={addForm.toggleForm}
      />

      <AddForm form={addForm} onCancel={addForm.closeForm} />

      <div className="relative grid" ref={drop.ref}>
        {drop.isDropTarget ? <FolderDropIndicator /> : null}
        <ItemStartDropZone folderId={folder.id} />
        {folder.items.map((item, itemIndex) => (
          <Item itemEntry={{ item, itemIndex }} key={item.id} />
        ))}
      </div>
    </section>
  );
}

function FolderDropIndicator() {
  return (
    <div
      aria-hidden="true"
      className="ring-primary/70 pointer-events-none absolute inset-x-0 top-0 bottom-0 z-10 rounded-sm ring-1 ring-inset"
    />
  );
}

type ItemStartDropZoneProps = { folderId: string };

function ItemStartDropZone({ folderId }: ItemStartDropZoneProps) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [isDropTarget, setIsDropTarget] = useState(false);

  useEffect(() => {
    if (!element) return;

    return dropTargetForElements({
      element,
      canDrop: ({ source }) => isItemDragData(source.data),
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
      {isDropTarget ? <DropIndicator placement="center" /> : null}
    </div>
  );
}
