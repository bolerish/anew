import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

import {
  isBookmarkFolderDragData,
  isBookmarkItemDragData,
  resolveBookmarkDropEdge,
  resolveVerticalDropEdge,
} from "../lib/bookmark-dnd";
import type { BookmarkDropEdge } from "../lib/bookmark-drag-drop";
import type { BookmarkFolder } from "./bookmark-model";
import { isRootBookmarkFolder } from "./bookmark-model";

export function useFolderDnd(folder: BookmarkFolder) {
  const [folderElement, setFolderElement] = useState<HTMLElement | null>(null);
  const [folderDropElement, setFolderDropElement] = useState<HTMLElement | null>(null);
  const [handleElement, setHandleElement] = useState<HTMLButtonElement | null>(null);
  const [isFolderDragSource, setIsFolderDragSource] = useState(false);
  const [isFolderDropTarget, setIsFolderDropTarget] = useState(false);
  const [folderDropEdge, setFolderDropEdge] = useState<BookmarkDropEdge | null>(null);
  const canDragFolder = !isRootBookmarkFolder(folder);

  function updateFolderDropIndicator(data: Record<string | symbol, unknown>) {
    setFolderDropEdge(resolveBookmarkDropEdge(data));
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
        canDrop: ({ source }) => isBookmarkFolderDragData(source.data) && source.data.folder.id !== folder.id,
        getData: ({ input, element }) => ({
          edge: resolveVerticalDropEdge(input.clientY, element),
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
      canDrop: ({ source }) => isBookmarkItemDragData(source.data),
      getData: () => ({ folder, kind: "folder" }),
      onDragEnter: () => setIsFolderDropTarget(true),
      onDragLeave: () => setIsFolderDropTarget(false),
      onDrop: () => setIsFolderDropTarget(false),
    });
  }, [folder, folderDropElement]);

  return {
    folderDrop: {
      isDropTarget: isFolderDropTarget,
      ref: setFolderDropElement,
    },
    folderSort: {
      dropEdge: folderDropEdge,
      handleRef: setHandleElement,
      isDragSource: isFolderDragSource,
      isDropTarget: folderDropEdge !== null,
      ref: setFolderElement,
    },
  };
}
