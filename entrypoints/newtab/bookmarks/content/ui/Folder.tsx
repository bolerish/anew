import { cn } from "~newtab/shared/lib/utils";

import { useAddItemForm } from "../../add/hooks/useAddItemForm";
import { AddItemForm } from "../../add/ui/AddItemForm";
import type { BookmarkFolder as BookmarkFolderValue } from "../../lib/model";
import { useBookmarkContext } from "../bookmark-provider";
import { useFolderDnd } from "../hooks/useFolderDnd";
import { FolderHeader } from "./FolderHeader";
import { FolderStartDropZone } from "./FolderStartDropZone";
import { Item } from "./Item";

type FolderProps = {
  folder: BookmarkFolderValue;
};

export function Folder({ folder }: FolderProps) {
  const { onBookmarksChange } = useBookmarkContext();
  const { folderDrop, folderSort } = useFolderDnd(folder);
  const addItem = useAddItemForm({
    parentId: folder.id,
    onCreated: onBookmarksChange,
  });

  return (
    <section className={cn("relative grid", folderSort.isDragSource && "opacity-20")} ref={folderSort.ref}>
      {folderSort.isDropTarget && folderSort.dropEdge ? <DropIndicator edge={folderSort.dropEdge} /> : null}
      <FolderHeader
        folder={folder}
        dnd={{
          handleRef: folderSort.handleRef,
          isDragSource: folderSort.isDragSource,
        }}
        onAddItem={addItem.toggleForm}
      />

      <AddItemForm addItem={addItem} onCancel={addItem.closeForm} />

      <div className="relative grid" ref={folderDrop.ref}>
        {folderDrop.isDropTarget ? <FolderDropIndicator /> : null}
        <FolderStartDropZone folderId={folder.id} />
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

function DropIndicator({ edge }: { edge: "after" | "before" }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "bg-primary pointer-events-none absolute right-0 left-0 z-20 h-[3px] rounded-full shadow-sm",
        edge === "before" ? "-top-1" : "-bottom-1",
      )}
    />
  );
}
