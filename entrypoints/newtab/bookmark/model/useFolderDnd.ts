import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  draggable,
  dropTargetForElements,
  type ElementEventBasePayload,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

import {
  isPointerInsideElement,
  type DropEdge,
  isFolderDragData,
  isItemDragData,
  resolveDropEdge,
  resolveVerticalEdge,
} from "../lib/dnd";
import { type BookmarkFolder } from "./types";

export function useFolderDnd(folder: BookmarkFolder) {
  const [folderElement, setFolderElement] = useState<HTMLElement | null>(null);
  const [folderDropElement, setFolderDropElement] = useState<HTMLElement | null>(null);
  const [handleElement, setHandleElement] = useState<HTMLButtonElement | null>(null);
  const [isFolderDragSource, setIsFolderDragSource] = useState(false);
  const [isFolderDropTarget, setIsFolderDropTarget] = useState(false);
  const [dropOffset, setDropOffset] = useState(0);
  const [folderDropEdge, setFolderDropEdge] = useState<DropEdge | null>(null);

  function clearFolderDropIndicator() {
    setFolderDropEdge(null);
  }

  function updateItemDropTarget(
    location: { current: { dropTargets: readonly { element: Element }[] } },
    element: Element,
  ) {
    setIsFolderDropTarget(location.current.dropTargets[0]?.element === element);
  }

  const [isSelfDrop, setIsSelfDrop] = useState(false);

  useEffect(() => {
    if (!folderElement) {
      return;
    }

    function updateFolderDropIndicator(
      data: Record<string | symbol, unknown>,
      sourceData: Record<string | symbol, unknown>,
    ) {
      const edge = resolveDropEdge(data);
      if (!isFolderDragData(sourceData)) return;
      const sourceId = sourceData.folder.id;
      const siblings = [...(folderElement?.parentElement?.children ?? [])].filter((element) =>
        element.id.startsWith("folder-"),
      );
      const targetIndex = siblings.indexOf(folderElement!);
      const neighbor = siblings[targetIndex + (edge === "before" ? -1 : 1)];
      const unchanged = sourceId === folder.id || neighbor?.id === `folder-${sourceId}`;
      const previous = siblings[targetIndex - 1];
      const offset =
        edge === "before" && previous
          ? previous.getBoundingClientRect().bottom - folderElement!.getBoundingClientRect().top
          : 0;
      setDropOffset(offset);
      setFolderDropEdge(unchanged ? null : edge);
    }

    function updateSelfDrop({ location }: ElementEventBasePayload) {
      setIsSelfDrop(isPointerInsideElement(folderElement!, location.current.input));
    }

    return combine(
      dropTargetForElements({
        element: folderElement,
        canDrop: ({ source }) => isFolderDragData(source.data),
        getIsSticky: () => true,
        getData: ({ input, element }) => ({
          edge: resolveVerticalEdge(input.clientY, element),
          folder,
          kind: "folder",
        }),
        onDrag: ({ self, source }) => {
          updateFolderDropIndicator(self.data, source.data);
        },
        onDragEnter: ({ self, source }) => {
          updateFolderDropIndicator(self.data, source.data);
        },
        onDragLeave: clearFolderDropIndicator,
        onDrop: clearFolderDropIndicator,
      }),
      handleElement
        ? draggable({
            element: folderElement,
            dragHandle: handleElement,
            onDrag: updateSelfDrop,
            onDropTargetChange: updateSelfDrop,
            getInitialData: () => ({ folder, kind: "folder" }),
            onGenerateDragPreview: () => flushSync(() => setIsFolderDragSource(true)),
            onDragStart: () => setIsFolderDragSource(true),
            onDrop: () => {
              setIsFolderDragSource(false);
              setIsSelfDrop(false);
            },
          })
        : () => {},
    );
  }, [folder, folderElement, handleElement]);

  useEffect(() => {
    if (!folderDropElement) {
      return;
    }

    return dropTargetForElements({
      element: folderDropElement,
      canDrop: ({ source }) => isItemDragData(source.data),
      getData: () => ({ folder, kind: "folder" }),
      onDrag: ({ location, self }) => updateItemDropTarget(location, self.element),
      onDragEnter: ({ location, self }) => updateItemDropTarget(location, self.element),
      onDragLeave: () => setIsFolderDropTarget(false),
      onDrop: () => setIsFolderDropTarget(false),
    });
  }, [folder, folderDropElement]);

  return {
    drop: {
      isDropTarget: isFolderDropTarget,
      ref: setFolderDropElement,
    },
    sort: {
      isSelfDrop,
      dropOffset,
      dropEdge: folderDropEdge,
      handleRef: setHandleElement,
      isDragSource: isFolderDragSource,
      isDropTarget: folderDropEdge !== null,
      ref: setFolderElement,
    },
  };
}
