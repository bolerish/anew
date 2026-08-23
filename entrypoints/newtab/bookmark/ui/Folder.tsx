import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { PlusIcon } from "@phosphor-icons/react";
import { Fragment, useEffect, useState } from "react";
import { UI_LANGUAGE } from "~shared/lib/language";
import { cn } from "~shared/lib/utils";
import { Accordion, AccordionContent, AccordionItem } from "~shared/ui/accordion";
import { Button } from "~shared/ui/button";

import { isItemDragData } from "../lib/dnd";
import { useBookmarkContext } from "../model/Provider";
import type { BookmarkFolder } from "../model/types";
import { useAddForm } from "../model/useAddForm";
import { useFolderDnd } from "../model/useFolderDnd";
import { AddFolder } from "./AddFolder";
import { AddForm } from "./AddForm";
import { DropIndicator } from "./DropIndicator";
import { FolderHeader } from "./FolderHeader";
import { Item } from "./Item";

type FolderProps = {
  folder: BookmarkFolder;
  parentId: string;
};

export function Folder({ folder, parentId }: FolderProps) {
  const { isSearchActive, onBookmarksChange } = useBookmarkContext();
  const { drop, sort } = useFolderDnd(folder);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const addForm = useAddForm({
    parentId: folder.id,
    onCreated: onBookmarksChange,
  });
  const activeDropIndex = drop.isDropTarget ? folder.items.length : dropIndex;

  return (
    <section className={cn("relative grid", sort.isDragSource && "opacity-20")} ref={sort.ref}>
      {sort.isDropTarget && sort.dropEdge ? <DropIndicator edge={sort.dropEdge} placement="outside" /> : null}
      <Accordion className="overflow-visible rounded-none border-0" defaultValue={[folder.id]}>
        <AccordionItem className="border-0 data-open:bg-transparent" value={folder.id}>
          <FolderHeader folder={folder} handleRef={sort.handleRef} isDragging={sort.isDragSource} />
          <AccordionContent className="h-auto p-0 [&_a]:no-underline">
            <div className="relative -mx-2 grid" ref={drop.ref}>
              <div className="relative grid">
                <ItemStartDropZone folderId={folder.id} onDropIndexChange={setDropIndex} />
                {folder.items.map((item, itemIndex) => (
                  <Fragment key={item.id}>
                    <ItemDropPlaceholder isActive={activeDropIndex === itemIndex} />
                    <Item itemEntry={{ item, itemIndex }} onDropIndexChange={setDropIndex} />
                  </Fragment>
                ))}
                <ItemDropPlaceholder isActive={activeDropIndex === folder.items.length} />
              </div>
              {!isSearchActive ? (
                <div className="mr-4 ml-8.5">
                  {!addForm.isAddingBookmark ? (
                    <Button
                      className="text-muted-foreground hover:text-foreground h-7 w-full justify-start gap-3"
                      size="sm"
                      type="button"
                      variant="ghost"
                      onClick={addForm.toggleForm}
                    >
                      <PlusIcon />
                      {UI_LANGUAGE.bookmark.action.addBookmark}
                    </Button>
                  ) : null}
                  <AddForm form={addForm} />
                </div>
              ) : null}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <AddFolder index={(folder.bookmarkIndex ?? 0) + 1} parentId={parentId} />
    </section>
  );
}

type ItemStartDropZoneProps = {
  folderId: string;
  onDropIndexChange: (index: number | null) => void;
};

function ItemDropPlaceholder({ isActive }: { isActive: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative mr-4 ml-9 overflow-hidden transition-[height] duration-150 ease-out",
        isActive ? "bg-muted h-8" : "h-0",
      )}
    >
      <div className={cn("transition-opacity duration-100", isActive ? "opacity-100" : "opacity-0")}>
        <DropIndicator edge="before" placement="inside" />
      </div>
    </div>
  );
}

function ItemStartDropZone({ folderId, onDropIndexChange }: ItemStartDropZoneProps) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!element) return;

    return dropTargetForElements({
      element,
      canDrop: ({ source }) => isItemDragData(source.data),
      getData: () => ({ kind: "item-start", parentId: folderId }),
      onDragEnter: () => onDropIndexChange(0),
      onDragLeave: () => onDropIndexChange(null),
      onDrop: () => onDropIndexChange(null),
    });
  }, [element, folderId, onDropIndexChange]);

  return <div aria-hidden="true" className="relative -mb-3 h-3" ref={setElement} />;
}
