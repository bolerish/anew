import { useSortable } from "@dnd-kit/react/sortable";
import { useCallback, useEffect, useRef } from "react";

import type { BookmarkItem } from "../../lib/model";
import type { BookmarkDragData } from "../../movement/lib/drag-drop";

type UseItemDndInput = {
  isActive: boolean;
  isEditing: boolean;
  item: BookmarkItem;
  itemIndex: number;
};

export function useItemDnd({ isActive, isEditing, item, itemIndex }: UseItemDndInput) {
  const { handleRef, isDragSource, isDropTarget, ref } = useSortable<BookmarkDragData>({
    accept: ["item"],
    data: { kind: "item", item },
    group: item.parentId,
    id: `item:${item.id}`,
    index: itemIndex,
    type: "item",
  });
  const itemElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || isEditing) {
      return;
    }

    itemElementRef.current?.scrollIntoView({ block: "nearest" });
  }, [isActive, isEditing]);

  const setItemElement = useCallback(
    (element: Element | null) => {
      itemElementRef.current = element instanceof HTMLElement ? element : null;
      ref(element);
    },
    [ref],
  );

  return {
    handleRef,
    isDragSource,
    isDropTarget,
    setItemElement,
  };
}
