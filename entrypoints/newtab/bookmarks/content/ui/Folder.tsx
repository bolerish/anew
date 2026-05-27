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
    <section
      className={cn("grid", folderSort.isDropTarget && "bg-accent", folderSort.isDragSource && "opacity-60")}
      ref={folderSort.ref}
    >
      <FolderHeader
        folder={folder}
        dnd={{
          handleRef: folderSort.handleRef,
          isDragSource: folderSort.isDragSource,
        }}
        onAddItem={addItem.toggleForm}
      />

      <AddItemForm addItem={addItem} onCancel={addItem.closeForm} />

      <div className={cn("grid", folderDrop.isDropTarget && "bg-accent/60")} ref={folderDrop.ref}>
        <FolderStartDropZone folderId={folder.id} />
        {folder.items.map((item, itemIndex) => (
          <Item itemEntry={{ item, itemIndex }} key={item.id} />
        ))}
      </div>
    </section>
  );
}
