import type { ElementEventBasePayload } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { z } from "zod";

import { bookmarkFolderSchema, bookmarkItemSchema, type BookmarkFolder, type BookmarkItem } from "../model/types";

const dropEdgeSchema = z.enum(["after", "before"]);
const dropEdgeDataSchema = z.object({ edge: dropEdgeSchema });
const folderDragSchema = z.object({ kind: z.literal("folder"), folder: bookmarkFolderSchema });
export type DropEdge = z.output<typeof dropEdgeSchema>;
const itemDragSchema = z.object({ kind: z.literal("item"), item: bookmarkItemSchema });
export const dragDataSchema = z.discriminatedUnion("kind", [folderDragSchema, itemDragSchema]);
export const dropDataSchema = z.discriminatedUnion("kind", [
  folderDragSchema.extend({ edge: dropEdgeSchema.optional() }),
  itemDragSchema.extend({ edge: dropEdgeSchema.optional() }),
  z.object({ kind: z.literal("item-start"), parentId: z.string().min(1) }),
]);
export type DragData = z.output<typeof dragDataSchema>;
export type DropData = z.output<typeof dropDataSchema>;

type Drop = {
  dragged: DragData;
  target: DropData;
};

/** Whether the drag pointer is inside the original element, including its edges. */
export function isPointerInsideElement(
  element: Element,
  { clientX, clientY }: { clientX: number; clientY: number },
): boolean {
  const bounds = element.getBoundingClientRect();
  const isWithinHorizontalBounds = clientX >= bounds.left && clientX <= bounds.right;
  const isWithinVerticalBounds = clientY >= bounds.top && clientY <= bounds.bottom;
  return isWithinHorizontalBounds && isWithinVerticalBounds;
}

export function resolveDrop(e: ElementEventBasePayload): Drop | null {
  const dragged = resolveDragData(e.source.data);
  const target = resolveDropData(e.location.current.dropTargets[0]?.data);

  if (!dragged || !target) {
    return null;
  }

  return { dragged, target };
}

export function resolveDragData(value: unknown): DragData | null {
  return isDragData(value) ? value : null;
}

export function isDragData(value: unknown): value is DragData {
  return dragDataSchema.safeParse(value).success;
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

export function resolveHorizontalEdge(clientX: number, element: Element): DropEdge {
  const bounds = element.getBoundingClientRect();
  return clientX >= bounds.left + bounds.width / 2 ? "after" : "before";
}

export function resolveDropEdge(value: unknown): DropEdge | null {
  return dropEdgeDataSchema.safeParse(value).data?.edge ?? null;
}

function resolveDropData(value: unknown): DropData | null {
  return isDropData(value) ? value : null;
}

export function isDropData(value: unknown): value is DropData {
  return dropDataSchema.safeParse(value).success;
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
