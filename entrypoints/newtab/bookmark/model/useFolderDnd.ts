import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

import { type DropEdge, isFolderDragData, isItemDragData, resolveDropEdge, resolveVerticalEdge } from "../lib/dnd";
import { isRootBookmarkFolder, type BookmarkFolder } from "./types";

export function useFolderDnd(folder: BookmarkFolder) {
  const [folderElement, setFolderElement] = useState<HTMLElement | null>(null);
  const [folderDropElement, setFolderDropElement] = useState<HTMLElement | null>(null);
  const [handleElement, setHandleElement] = useState<HTMLButtonElement | null>(null);
  const [isFolderDragSource, setIsFolderDragSource] = useState(false);
  const [isFolderDropTarget, setIsFolderDropTarget] = useState(false);
  const [folderDropEdge, setFolderDropEdge] = useState<DropEdge | null>(null);
  const canDragFolder = !isRootBookmarkFolder(folder);

  function updateFolderDropIndicator(data: Record<string | symbol, unknown>) {
    setFolderDropEdge(resolveDropEdge(data));
  }

  function clearFolderDropIndicator() {
    setFolderDropEdge(null);
  }

  useEffect(() => {
    if (!folderElement) {
      return;
    }

    return combine(
      dropTargetForElements({
        element: folderElement,
        canDrop: ({ source }) => isFolderDragData(source.data) && source.data.folder.id !== folder.id,
        getData: ({ input, element }) => ({
          edge: resolveVerticalEdge(input.clientY, element),
          folder,
          kind: "folder",
        }),
        onDrag: ({ self }) => updateFolderDropIndicator(self.data),
        onDragEnter: ({ self }) => updateFolderDropIndicator(self.data),
        onDragLeave: clearFolderDropIndicator,
        onDrop: clearFolderDropIndicator,
      }),
      canDragFolder && handleElement
        ? draggable({
            element: folderElement,
            dragHandle: handleElement,
            getInitialData: () => ({ folder, kind: "folder" }),
            onGenerateDragPreview: () => {
              flushSync(() => setIsFolderDragSource(true));
            },
            onDragStart: () => setIsFolderDragSource(true),
            onDrop: () => setIsFolderDragSource(false),
          })
        : () => {},
    );
  }, [canDragFolder, folder, folderElement, handleElement]);

  useEffect(() => {
    if (!folderDropElement) {
      return;
    }

    return dropTargetForElements({
      element: folderDropElement,
      canDrop: ({ source }) => isItemDragData(source.data),
      getData: () => ({ folder, kind: "folder" }),
      onDragEnter: () => setIsFolderDropTarget(true),
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
      dropEdge: folderDropEdge,
      handleRef: setHandleElement,
      isDragSource: isFolderDragSource,
      isDropTarget: folderDropEdge !== null,
      ref: setFolderElement,
    },
  };
}
