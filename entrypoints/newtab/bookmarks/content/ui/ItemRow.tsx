import type { MouseEvent } from "react";
import { UI_LANGUAGE } from "~newtab/shared/lib/language";
import { cn } from "~newtab/shared/lib/utils";

import { MoveButton, RemoveButton } from "../../ui/BookmarkActions";
import { useItemSiblingMove } from "../hooks/useItemSiblingMove";
import { deriveItemLabel, type BookmarkItemEntry, type BookmarkItemView } from "../lib";
import { ItemIcon } from "./ItemIcon";

type ItemRowProps = {
  itemEntry: BookmarkItemEntry;
  itemView: BookmarkItemView;
  suppressBookmarkActions: boolean;
  onEdit: (event: MouseEvent<HTMLElement>) => void;
  onRemove: () => void;
};

export function ItemRow({ itemEntry, itemView, onEdit, onRemove, suppressBookmarkActions }: ItemRowProps) {
  const { item } = itemEntry;
  const { icon, iconMarker, showBookmarkIcon } = itemView;
  const { moveItemDown, moveItemUp, nextItem, previousItem } = useItemSiblingMove(item);

  return (
    <>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_2rem] items-center">
        <div className="relative min-w-0">
          <button
            aria-hidden="true"
            className="focus-visible:ring-ring absolute inset-0 rounded-sm outline-none focus-visible:ring-2"
            tabIndex={-1}
            type="button"
            onClick={onEdit}
          />
          <div
            className={cn(
              "pointer-events-none relative z-10 grid min-w-0 items-center pr-2",
              showBookmarkIcon ? "grid-cols-mds-bookmark-item-icon-title gap-2" : "grid-cols-[minmax(0,auto)]",
            )}
          >
            {showBookmarkIcon ? <ItemIcon icon={icon} label={deriveItemLabel(item)} marker={iconMarker} /> : null}
            <a
              className="text-mds-bookmark-item text-foreground pointer-events-auto w-fit min-w-0 truncate text-left font-normal"
              href={item.url}
            >
              {deriveItemLabel(item)}
            </a>
          </div>
        </div>
        <button
          aria-label={UI_LANGUAGE.bookmarks.action.edit}
          className="focus-visible:ring-ring h-full min-h-7 rounded-sm outline-none focus-visible:ring-2"
          type="button"
          onClick={onEdit}
        />
      </div>
      <div
        className={cn(
          "flex w-21 items-center justify-end gap-0 opacity-0 transition-opacity group-hover/bookmark-row:opacity-100 focus-within:opacity-100",
          suppressBookmarkActions && "opacity-0!",
        )}
      >
        <MoveButton
          disabled={!previousItem}
          direction="up"
          label={UI_LANGUAGE.bookmarks.action.moveUp}
          onMove={moveItemUp}
        />
        <MoveButton
          disabled={!nextItem}
          direction="down"
          label={UI_LANGUAGE.bookmarks.action.moveDown}
          onMove={moveItemDown}
        />
        <RemoveButton label={UI_LANGUAGE.bookmarks.action.remove} onRemove={onRemove} />
      </div>
    </>
  );
}
