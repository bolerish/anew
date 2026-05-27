import { useCallback } from "react";
import { UI_LANGUAGE } from "~newtab/shared/lib/language";
import { cn } from "~newtab/shared/lib/utils";
import { Collapsible, CollapsibleContent } from "~newtab/shared/ui/collapsible";

import { useBookmarkContext } from "../bookmark-provider";
import { useItemDnd } from "../hooks/useItemDnd";
import { useItemInlineEdit } from "../hooks/useItemInlineEdit";
import { deriveBookmarkItemView, type BookmarkItemEntry } from "../lib";
import { deleteBookmarkItem } from "../lib/mutation";
import { DragHandle } from "./DragHandle";
import { ItemEditForm } from "./ItemEditForm";
import { ItemRow } from "./ItemRow";

type ItemProps = {
  itemEntry: BookmarkItemEntry;
};

export function Item({ itemEntry }: ItemProps) {
  const { item, itemIndex } = itemEntry;
  const { activeBookmark, bookmarkIconMode } = useBookmarkContext();
  const itemView = deriveBookmarkItemView(item, bookmarkIconMode);
  const isActive = activeBookmark?.kind === "item" && activeBookmark.id === item.id;
  const {
    handleItemBlur,
    handleItemSubmit,
    inlineTitle,
    inlineUrlIsValid,
    isEditing,
    openItemEditor,
    revealBookmarkActions,
    suppressBookmarkActions,
  } = useItemInlineEdit(item);
  const { handleRef, isDragSource, isDropTarget, setItemElement } = useItemDnd({
    isActive,
    isEditing,
    item,
    itemIndex,
  });

  const deleteItem = useCallback(() => {
    void deleteBookmarkItem(item);
  }, [item]);

  return (
    <div
      className={cn("group/bookmark-item", isDropTarget && "bg-accent", isDragSource && "opacity-60")}
      data-suppress-bookmark-actions={suppressBookmarkActions ? "" : undefined}
      ref={setItemElement}
      onMouseMove={suppressBookmarkActions ? revealBookmarkActions : undefined}
    >
      <div className="group/bookmark-row relative min-h-8">
        <DragHandle isDragging={isDragSource} label={UI_LANGUAGE.bookmarks.action.move} ref={handleRef} />

        <Collapsible open={isEditing}>
          {!isEditing ? (
            <div
              className={cn(
                "hover:bg-accent grid-cols-mds-bookmark-item grid min-h-7 min-w-0 items-center gap-2 border-b border-transparent p-1 transition-colors",
                isActive && "bg-accent",
              )}
            >
              <ItemRow
                itemEntry={itemEntry}
                itemView={itemView}
                onEdit={openItemEditor}
                onRemove={deleteItem}
                suppressBookmarkActions={suppressBookmarkActions}
              />
            </div>
          ) : null}
          <CollapsibleContent className="collapsible-content">
            <ItemEditForm
              inlineTitle={inlineTitle}
              inlineUrlIsValid={inlineUrlIsValid}
              itemView={itemView}
              onBlur={handleItemBlur}
              onRemove={deleteItem}
              onSubmit={handleItemSubmit}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
