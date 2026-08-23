import { CheckIcon, TrashSimpleIcon } from "@phosphor-icons/react";
import { useEffect, useId, useRef } from "react";
import { stopInteraction } from "~shared/lib/event";
import { UI_LANGUAGE } from "~shared/lib/language";
import { cn } from "~shared/lib/utils";
import { Button } from "~shared/ui/button";
import { Input } from "~shared/ui/input";

import { deleteItem as deleteBookmarkItem } from "../api/update";
import { deriveBookmarkItemView, deriveItemLabel, type BookmarkItemEntry } from "../lib/item-view";
import { useBookmarkContext } from "../model/Provider";
import { useItemDnd } from "../model/useItemDnd";
import { useItemEdit } from "../model/useItemEdit";
import { DragHandle } from "./DragHandle";
import { ItemIcon } from "./ItemIcon";

type ItemProps = {
  itemEntry: BookmarkItemEntry;
  onDropIndexChange: (index: number | null) => void;
};

export function Item({ itemEntry, onDropIndexChange }: ItemProps) {
  const { item, itemIndex } = itemEntry;
  const { activeBookmark, bookmarkIconMode } = useBookmarkContext();
  const view = deriveBookmarkItemView(item, bookmarkIconMode);
  const { icon, iconMarker, showBookmarkIcon } = view;
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const urlErrorId = useId();
  const isActive = activeBookmark?.kind === "item" && activeBookmark.id === item.id;
  const { editor, handleSubmit, isEditing, isUrlValid, openEditor, showActions, suppressActions } = useItemEdit(item);
  const { handleRef, isDragSource, setItemElement } = useItemDnd({
    isActive,
    isEditing,
    item,
    itemIndex,
    onDropIndexChange,
  });

  function deleteItem() {
    void deleteBookmarkItem(item);
  }

  useEffect(() => {
    if (!isEditing) return;

    titleInputRef.current?.focus();
    titleInputRef.current?.select();
  }, [isEditing]);

  return (
    <div
      className={cn("group/bookmark-item relative mr-4 ml-9", isDragSource && "opacity-20")}
      data-suppress-bookmark-actions={suppressActions ? "" : undefined}
      ref={setItemElement}
      onMouseMove={suppressActions ? showActions : undefined}
    >
      <div className="group/bookmark-row relative min-h-8">
        <DragHandle kind="item" isDragging={isDragSource} label={UI_LANGUAGE.bookmark.action.move} ref={handleRef} />
        {!isEditing ? (
          <div
            className={cn(
              "hover:bg-accent grid-cols-mds-bookmark-item grid min-h-7 min-w-0 items-center gap-2 border-b border-transparent p-1 transition-colors",
              isActive && "bg-accent",
            )}
          >
            <div className="relative grid min-w-0 items-center">
              <button
                aria-label={UI_LANGUAGE.bookmark.action.edit}
                className="focus-visible:ring-ring absolute inset-0 cursor-text rounded-sm outline-none focus-visible:ring-2"
                type="button"
                onClick={openEditor}
                onPointerDown={openEditor}
              />
              <div
                className={cn(
                  "pointer-events-none relative z-10 grid min-w-0 items-center pr-2",
                  showBookmarkIcon ? "grid-cols-mds-bookmark-item-icon-title gap-2" : "grid-cols-[minmax(0,auto)]",
                )}
              >
                {showBookmarkIcon ? <ItemIcon icon={icon} label={deriveItemLabel(item)} marker={iconMarker} /> : null}
                <a
                  className="text-mds-bookmark-item text-foreground pointer-events-auto w-fit max-w-lg min-w-0 truncate text-left font-normal"
                  href={item.url}
                >
                  {deriveItemLabel(item)}
                </a>
              </div>
            </div>
            <div
              className={cn(
                "flex w-21 items-center justify-end gap-0 opacity-0 transition-opacity group-hover/bookmark-row:opacity-100 focus-within:opacity-100",
                suppressActions && "opacity-0!",
              )}
            >
              <Button
                aria-label={UI_LANGUAGE.bookmark.action.remove}
                className="text-muted-foreground hover:text-muted-foreground hover:bg-transparent"
                size="icon-sm"
                title={UI_LANGUAGE.bookmark.action.remove}
                variant="ghost"
                onMouseDown={stopInteraction}
                onClick={(event) => {
                  stopInteraction(event);
                  deleteItem();
                }}
              >
                <TrashSimpleIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
        {isEditing ? (
          <form
            className={cn(
              "border-border grid min-w-0 items-start gap-x-2 gap-y-1 border-b p-1",
              showBookmarkIcon ? "grid-cols-mds-bookmark-item-icon" : "grid-cols-[minmax(0,1fr)_auto]",
            )}
            data-inline-bookmark-editor=""
            onSubmit={handleSubmit}
          >
            {showBookmarkIcon ? (
              <div className="row-span-2 flex h-7 items-center" data-bookmark-edit-icon="">
                <ItemIcon icon={icon} label={deriveItemLabel(item)} marker={iconMarker} />
              </div>
            ) : null}
            <div className="grid min-w-0 gap-1">
              <Input
                aria-label={UI_LANGUAGE.bookmark.label.title}
                className="text-mds-bookmark-item placeholder:text-mds-shortcut-label md:text-mds-bookmark-item h-7 rounded-none border-0 bg-transparent px-0 font-normal caret-current focus-visible:ring-0"
                ref={titleInputRef}
                value={editor.inlineTitle}
                onChange={(event) => editor.setInlineTitle(event.target.value)}
              />
              <Input
                aria-label={UI_LANGUAGE.bookmark.label.url}
                aria-describedby={isUrlValid ? undefined : urlErrorId}
                aria-invalid={!isUrlValid}
                className="text-mds-bookmark-item placeholder:text-mds-shortcut-label md:text-mds-bookmark-item h-7 rounded-none border-0 bg-transparent px-0 font-normal caret-current focus-visible:ring-0"
                title={isUrlValid ? undefined : UI_LANGUAGE.bookmark.error.invalidUrl}
                value={editor.inlineUrl}
                onChange={(event) => editor.setInlineUrl(event.target.value)}
              />
              {!isUrlValid ? (
                <p className="text-destructive text-mds-caption" id={urlErrorId} role="alert">
                  {UI_LANGUAGE.bookmark.error.invalidUrl}
                </p>
              ) : null}
            </div>
            <div className="flex h-7 items-center justify-end gap-0">
              <Button
                aria-label={UI_LANGUAGE.bookmark.action.save}
                className="text-muted-foreground hover:text-muted-foreground hover:bg-transparent"
                disabled={!isUrlValid}
                size="icon-sm"
                title={UI_LANGUAGE.bookmark.action.save}
                variant="ghost"
                onMouseDown={stopInteraction}
                onClick={(event) => {
                  stopInteraction(event);
                  void editor.updateCurrentInlineEditor();
                }}
              >
                <CheckIcon className="h-4 w-4" />
              </Button>
              <Button
                aria-label={UI_LANGUAGE.bookmark.action.remove}
                className="text-muted-foreground hover:text-muted-foreground hover:bg-transparent"
                size="icon-sm"
                title={UI_LANGUAGE.bookmark.action.remove}
                variant="ghost"
                onMouseDown={stopInteraction}
                onClick={(event) => {
                  stopInteraction(event);
                  deleteItem();
                }}
              >
                <TrashSimpleIcon className="h-4 w-4" />
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}
