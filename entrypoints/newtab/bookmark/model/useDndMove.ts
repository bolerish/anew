import type { ElementEventBasePayload } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import { moveFolder, moveItem } from "../api/move";
import { type DropData, computeFolderInsertIndex, computeItemInsertIndex, resolveDrop } from "../lib/dnd";
import type { BookmarkFolder, BookmarkItem } from "./types";

type UseDndMoveInput = {
  folders: readonly BookmarkFolder[];
  isSearchActive: boolean;
  onBookmarksChange: () => Promise<void>;
};

export function useDndMove({ folders, isSearchActive, onBookmarksChange }: UseDndMoveInput) {
  async function handleDrop(event: ElementEventBasePayload) {
    if (isSearchActive) return;

    const drop = resolveDrop(event);
    if (!drop) return;

    try {
      let moved = false;

      if (drop.dragged.kind === "folder") {
        moved = await moveFolderTo(drop.dragged.folder, drop.target);
      } else {
        moved = await moveItemTo(drop.dragged.item, drop.target);
      }

      if (moved) await onBookmarksChange();
    } catch (error) {
      console.error("[newtab:bookmark] failed to move bookmark", error);
    }
  }

  async function moveFolderTo(folder: BookmarkFolder, target: DropData): Promise<boolean> {
    if (target.kind !== "folder" || folder.id === target.folder.id || !target.folder.parentId) {
      return false;
    }

    await moveFolder(folder, {
      index: computeFolderInsertIndex(target.folder, target.edge),
      parentId: target.folder.parentId,
    });
    return true;
  }

  async function moveItemTo(item: BookmarkItem, target: DropData): Promise<boolean> {
    if (target.kind === "item-start") {
      if (item.parentId === target.parentId && getItemIndex(item) === 0) return false;

      await moveItem(item, { index: 0, parentId: target.parentId });
      return true;
    }

    if (target.kind === "folder") {
      await moveItem(item, { parentId: target.folder.id });
      return true;
    }

    if (item.id === target.item.id) return false;

    await moveItem(item, {
      index: computeItemInsertIndex(folders, target.item, target.edge),
      parentId: target.item.parentId,
    });
    return true;
  }

  function getItemIndex(item: BookmarkItem): number {
    const folder = folders.find((candidate) => candidate.id === item.parentId);
    return folder?.items.findIndex((candidate) => candidate.id === item.id) ?? -1;
  }

  return { handleDrop };
}
