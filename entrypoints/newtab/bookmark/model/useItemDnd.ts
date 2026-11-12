import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
  type ElementEventBasePayload,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useState } from "react";

import {
  isPointerInsideElement,
  isItemDragData,
  resolveDropEdge,
  resolveVerticalEdge,
  resolveHorizontalEdge,
} from "../lib/dnd";
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

  const [isSelfDrop, setIsSelfDrop] = useState(false);

  useEffect(() => {
    if (!itemElement) {
      return;
    }

    function updateDropIndex(data: Record<string | symbol, unknown>, sourceData: Record<string | symbol, unknown>) {
      const edge = resolveDropEdge(data);
      if (!isItemDragData(sourceData)) return;
      const siblings = [...(itemElement?.parentElement?.children ?? [])].filter((element) =>
        element.id.startsWith("bookmark-"),
      );
      const targetIndex = siblings.indexOf(itemElement!);
      const neighbor = siblings[targetIndex + (edge === "before" ? -1 : 1)];
      if (sourceData.item.id === item.id || neighbor?.id === `bookmark-${sourceData.item.id}`) {
        onDropIndexChange(null);
        return;
      }

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

    function updateSelfDrop({ location }: ElementEventBasePayload) {
      setIsSelfDrop(isPointerInsideElement(itemElement!, location.current.input));
    }

    return combine(
      handleElement
        ? draggable({
            element: itemElement,
            dragHandle: handleElement,
            onDrag: updateSelfDrop,
            onDropTargetChange: updateSelfDrop,
            getInitialData: () => ({ kind: "item", item }),
            onDragStart: () => {
              setIsDragSource(true);
            },
            onDrop: () => {
              setIsDragSource(false);
              setIsSelfDrop(false);
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
          updateDropIndex(self.data, source.data);
        },
        onDragEnter: ({ self, source }) => {
          updateDropIndex(self.data, source.data);
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
    isSelfDrop,
    setItemElement,
  };
}
