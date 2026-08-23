import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useState } from "react";

import { isItemDragData, resolveDropEdge, resolveVerticalEdge } from "../lib/dnd";
import type { BookmarkItem } from "./types";

type UseItemDndInput = {
  isActive: boolean;
  isEditing: boolean;
  item: BookmarkItem;
  itemIndex: number;
  onDropIndexChange: (index: number | null) => void;
};

export function useItemDnd({ isActive, isEditing, item, itemIndex, onDropIndexChange }: UseItemDndInput) {
  const [handleElement, setHandleElement] = useState<HTMLButtonElement | null>(null);
  const [itemElement, setItemElement] = useState<HTMLElement | null>(null);
  const [isDragSource, setIsDragSource] = useState(false);

  useEffect(() => {
    if (!itemElement) {
      return;
    }

    function updateDropIndex(data: Record<string | symbol, unknown>) {
      const edge = resolveDropEdge(data);

      if (edge === "before") {
        onDropIndexChange(itemIndex);
        return;
      }

      if (edge === "after") {
        onDropIndexChange(itemIndex + 1);
        return;
      }

      onDropIndexChange(null);
    }

    function clearDropIndex() {
      onDropIndexChange(null);
    }

    return combine(
      handleElement
        ? draggable({
            element: itemElement,
            dragHandle: handleElement,
            getInitialData: () => ({ kind: "item", item }),
            onDragStart: () => {
              setIsDragSource(true);
            },
            onDrop: () => {
              setIsDragSource(false);
              clearDropIndex();
            },
          })
        : () => {},
      dropTargetForElements({
        element: itemElement,
        canDrop: ({ source }) => isItemDragData(source.data) && source.data.item.id !== item.id,
        getIsSticky: () => true,
        getData: ({ input, element }) => ({
          edge: resolveVerticalEdge(input.clientY, element),
          item,
          kind: "item",
        }),
        onDrag: ({ self }) => updateDropIndex(self.data),
        onDragEnter: ({ self }) => updateDropIndex(self.data),
        onDragLeave: clearDropIndex,
        onDrop: clearDropIndex,
      }),
    );
  }, [handleElement, item, itemElement, itemIndex, onDropIndexChange]);

  useEffect(() => {
    if (!isActive || isEditing) {
      return;
    }

    itemElement?.scrollIntoView({ block: "nearest" });
  }, [isActive, isEditing, itemElement]);

  return {
    handleRef: setHandleElement,
    isDragSource,
    setItemElement,
  };
}
