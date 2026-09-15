import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useState } from "react";

import { isItemDragData, resolveDropEdge, resolveVerticalEdge, resolveHorizontalEdge } from "../lib/dnd";
import type { BookmarkItem } from "./types";

type UseItemDndInput = {
  horizontal?: boolean;
  isActive: boolean;
  isEditing: boolean;
  item: BookmarkItem;
  itemIndex: number;
  onDropIndexChange: (index: number | null) => void;
};

export function useItemDnd({
  horizontal = false,
  isActive,
  isEditing,
  item,
  itemIndex,
  onDropIndexChange,
}: UseItemDndInput) {
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
        canDrop: ({ source }) => isItemDragData(source.data),
        getIsSticky: () => true,
        getData: ({ input, element }) => ({
          edge: horizontal
            ? resolveHorizontalEdge(input.clientX, element)
            : resolveVerticalEdge(input.clientY, element),
          item,
          kind: "item",
        }),
        onDrag: ({ self, source }) => {
          if (isItemDragData(source.data) && source.data.item.id === item.id) clearDropIndex();
          else updateDropIndex(self.data);
        },
        onDragEnter: ({ self, source }) => {
          if (isItemDragData(source.data) && source.data.item.id === item.id) clearDropIndex();
          else updateDropIndex(self.data);
        },
        onDragLeave: clearDropIndex,
        onDrop: clearDropIndex,
      }),
    );
  }, [horizontal, handleElement, item, itemElement, itemIndex, onDropIndexChange]);

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
