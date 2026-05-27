import type { DragEndEvent } from "@dnd-kit/react";

import type { BookmarkDragData, BookmarkDropData } from "./drag-drop";

type BookmarkDrop = {
  dragged: BookmarkDragData;
  target: BookmarkDropData;
};

export function resolveBookmarkDrop(event: DragEndEvent): BookmarkDrop | null {
  if (event.canceled) {
    return null;
  }

  const dragged = resolveBookmarkDragData(event);
  const target = resolveBookmarkDropData(event);

  if (!dragged || !target) {
    return null;
  }

  return { dragged, target };
}

function resolveBookmarkDragData(event: DragEndEvent): BookmarkDragData | null {
  const dragData = event.operation.source?.data;

  if (isBookmarkDragData(dragData)) {
    return dragData;
  }

  return null;
}

function resolveBookmarkDropData(event: DragEndEvent): BookmarkDropData | null {
  const dropData = event.operation.target?.data;

  if (isBookmarkDropData(dropData)) {
    return dropData;
  }

  return null;
}

function isBookmarkDragData(value: unknown): value is BookmarkDragData {
  if (!isRecord(value)) {
    return false;
  }

  if (value.kind === "folder") {
    return isRecord(value.folder);
  }

  if (value.kind === "item") {
    return isRecord(value.item);
  }

  return false;
}

function isBookmarkDropData(value: unknown): value is BookmarkDropData {
  if (!isRecord(value)) {
    return false;
  }

  if (value.kind === "item-start") {
    return typeof value.parentId === "string";
  }

  return isBookmarkDragData(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}
