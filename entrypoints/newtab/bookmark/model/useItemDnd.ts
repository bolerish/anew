import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

import { type DropEdge, isItemDragData, resolveDropEdge, resolveVerticalEdge } from "../lib/dnd";
import type { BookmarkItem } from "./types";

type UseItemDndInput = {
  isActive: boolean;
  isEditing: boolean;
  item: BookmarkItem;
};

export function useItemDnd({ isActive, isEditing, item }: UseItemDndInput) {
  const [handleElement, setHandleElement] = useState<HTMLButtonElement | null>(null);
  const [itemElement, setItemElement] = useState<HTMLElement | null>(null);
  const [isDragSource, setIsDragSource] = useState(false);
  const [dropEdge, setDropEdge] = useState<DropEdge | null>(null);

  function updateDropIndicator(data: Record<string | symbol, unknown>) {
    setDropEdge(resolveDropEdge(data));
  }

  function clearDropIndicator() {
    setDropEdge(null);
  }

  useEffect(() => {
    if (!itemElement) {
      return;
    }

    return combine(
      draggable({
        element: itemElement,
        dragHandle: handleElement ?? undefined,
        getInitialData: () => ({ kind: "item", item }),
        onGenerateDragPreview: () => {
          flushSync(() => setIsDragSource(true));
        },
        onDragStart: () => setIsDragSource(true),
        onDrop: () => setIsDragSource(false),
      }),
      dropTargetForElements({
        element: itemElement,
        canDrop: ({ source }) => isItemDragData(source.data) && source.data.item.id !== item.id,
        getData: ({ input, element }) => ({
          edge: resolveVerticalEdge(input.clientY, element),
          item,
          kind: "item",
        }),
        onDrag: ({ self }) => updateDropIndicator(self.data),
        onDragEnter: ({ self }) => updateDropIndicator(self.data),
        onDragLeave: clearDropIndicator,
        onDrop: clearDropIndicator,
      }),
    );
  }, [handleElement, item, itemElement]);

  useEffect(() => {
    if (!isActive || isEditing) {
      return;
    }

    itemElement?.scrollIntoView({ block: "nearest" });
  }, [isActive, isEditing, itemElement]);

  return {
    handleRef: setHandleElement,
    dropEdge,
    isDragSource,
    isDropTarget: dropEdge !== null,
    setItemElement,
  };
}
