import type { ElementEventBasePayload } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import type { BookmarkDragData, BookmarkDropData, BookmarkDropEdge } from "./bookmark-drag-drop";

type BookmarkDrop = {
  dragged: BookmarkDragData;
  target: BookmarkDropData;
};

export function resolveBookmarkDrop(event: ElementEventBasePayload): BookmarkDrop | null {
  const dragged = resolveBookmarkDragData(event.source.data);
  const target = resolveBookmarkDropData(event.location.current.dropTargets[0]?.data);

  if (!dragged || !target) {
    return null;
  }

  return { dragged, target };
}

export function resolveBookmarkDragData(value: unknown): BookmarkDragData | null {
  return isBookmarkDragData(value) ? value : null;
}

export function isBookmarkDragData(value: unknown): value is BookmarkDragData {
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

export function isBookmarkItemDragData(value: unknown): value is Extract<BookmarkDragData, { kind: "item" }> {
  return isBookmarkDragData(value) && value.kind === "item";
}

export function isBookmarkFolderDragData(value: unknown): value is Extract<BookmarkDragData, { kind: "folder" }> {
  return isBookmarkDragData(value) && value.kind === "folder";
}

export function resolveVerticalDropEdge(clientY: number, element: Element): BookmarkDropEdge {
  const bounds = element.getBoundingClientRect();
  const midpoint = bounds.top + bounds.height / 2;

  return clientY >= midpoint ? "after" : "before";
}

export function resolveBookmarkDropEdge(value: unknown): BookmarkDropEdge | null {
  if (!isRecord(value)) {
    return null;
  }

  return value.edge === "after" || value.edge === "before" ? value.edge : null;
}

function resolveBookmarkDropData(value: unknown): BookmarkDropData | null {
  return isBookmarkDropData(value) ? value : null;
}

export function isBookmarkDropData(value: unknown): value is BookmarkDropData {
  if (!isRecord(value)) {
    return false;
  }

  if (value.kind === "item-start") {
    return typeof value.parentId === "string";
  }

  if (value.kind === "folder") {
    return isRecord(value.folder) && isOptionalDropEdge(value.edge);
  }

  if (value.kind === "item") {
    return isRecord(value.item) && isOptionalDropEdge(value.edge);
  }

  return false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isOptionalDropEdge(value: unknown): boolean {
  return value === undefined || value === "after" || value === "before";
}
