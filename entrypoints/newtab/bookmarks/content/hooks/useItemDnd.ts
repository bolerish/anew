import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import type { BookmarkItem } from "../../lib/model";
import {
  isBookmarkItemDragData,
  resolveBookmarkDropEdge,
  resolveVerticalDropEdge,
} from "../../movement/lib/dnd-protocol";
import type { BookmarkDropEdge } from "../../movement/lib/drag-drop";

type UseItemDndInput = {
  isActive: boolean;
  isEditing: boolean;
  item: BookmarkItem;
};

export function useItemDnd({ isActive, isEditing, item }: UseItemDndInput) {
  const [handleElement, setHandleElement] = useState<HTMLButtonElement | null>(null);
  const [itemElement, setItemElementState] = useState<HTMLElement | null>(null);
  const [isDragSource, setIsDragSource] = useState(false);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [dropEdge, setDropEdge] = useState<BookmarkDropEdge | null>(null);
  const itemElementRef = useRef<HTMLElement | null>(null);

  function updateDropIndicator(data: Record<string | symbol, unknown>) {
    setIsDropTarget(true);
    setDropEdge(resolveBookmarkDropEdge(data));
  }

  function clearDropIndicator() {
    setIsDropTarget(false);
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
        canDrop: ({ source }) => isBookmarkItemDragData(source.data) && source.data.item.id !== item.id,
        getData: ({ input, element }) => ({
          edge: resolveVerticalDropEdge(input.clientY, element),
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

    itemElementRef.current?.scrollIntoView({ block: "nearest" });
  }, [isActive, isEditing]);

  const setItemElement = useCallback((element: HTMLElement | null) => {
    itemElementRef.current = element;
    setItemElementState(element);
  }, []);

  return {
    handleRef: setHandleElement,
    dropEdge,
    isDragSource,
    isDropTarget,
    setItemElement,
  };
}
