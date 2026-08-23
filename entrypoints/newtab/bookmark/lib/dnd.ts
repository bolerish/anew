import type { ElementEventBasePayload } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import type { BookmarkFolder, BookmarkItem } from "../model/types";

export type DropEdge = "after" | "before";

export type DragData = { kind: "folder"; folder: BookmarkFolder } | { kind: "item"; item: BookmarkItem };

export type DropData =
  | { edge?: DropEdge; kind: "folder"; folder: BookmarkFolder }
  | { edge?: DropEdge; kind: "item"; item: BookmarkItem }
  | { kind: "item-start"; parentId: string };

type Drop = {
  dragged: DragData;
  target: DropData;
};

export function resolveDrop(event: ElementEventBasePayload): Drop | null {
  const dragged = resolveDragData(event.source.data);
  const target = resolveDropData(event.location.current.dropTargets[0]?.data);

  if (!dragged || !target) {
    return null;
  }

  return { dragged, target };
}

export function resolveDragData(value: unknown): DragData | null {
  return isDragData(value) ? value : null;
}

export function isDragData(value: unknown): value is DragData {
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

export function isItemDragData(value: unknown): value is Extract<DragData, { kind: "item" }> {
  return isDragData(value) && value.kind === "item";
}

export function isFolderDragData(value: unknown): value is Extract<DragData, { kind: "folder" }> {
  return isDragData(value) && value.kind === "folder";
}

export function resolveVerticalEdge(clientY: number, element: Element): DropEdge {
  const bounds = element.getBoundingClientRect();
  const midpoint = bounds.top + bounds.height / 2;

  return clientY >= midpoint ? "after" : "before";
}

export function resolveDropEdge(value: unknown): DropEdge | null {
  if (!isRecord(value)) {
    return null;
  }

  return value.edge === "after" || value.edge === "before" ? value.edge : null;
}

function resolveDropData(value: unknown): DropData | null {
  return isDropData(value) ? value : null;
}

export function isDropData(value: unknown): value is DropData {
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

export function computeItemInsertIndex(
  folders: readonly BookmarkFolder[],
  targetItem: BookmarkItem,
  edge: DropEdge = "before",
): number {
  const targetFolder = folders.find((folder) => folder.items.some((item) => item.id === targetItem.id));

  if (!targetFolder) {
    return edge === "after" ? (targetItem.bookmarkIndex ?? 0) + 1 : (targetItem.bookmarkIndex ?? 0);
  }

  const targetIndex = targetItem.bookmarkIndex ?? targetFolder.items.findIndex((item) => item.id === targetItem.id);

  return Math.max(0, edge === "after" ? targetIndex + 1 : targetIndex);
}

export function computeFolderInsertIndex(folder: BookmarkFolder, edge: DropEdge = "before"): number {
  const index = folder.bookmarkIndex ?? 0;

  return Math.max(0, edge === "after" ? index + 1 : index);
}
