import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

import type { BookmarkFolder } from "../../lib/model";
import { isRootBookmarkFolder } from "../../lib/model";
import {
  isBookmarkFolderDragData,
  isBookmarkItemDragData,
  resolveBookmarkDropEdge,
  resolveVerticalDropEdge,
} from "../../movement/lib/dnd-protocol";
import type { BookmarkDropEdge } from "../../movement/lib/drag-drop";

export function useFolderDnd(folder: BookmarkFolder) {
  const [folderElement, setFolderElement] = useState<HTMLElement | null>(null);
  const [folderDropElement, setFolderDropElement] = useState<HTMLElement | null>(null);
  const [handleElement, setHandleElement] = useState<HTMLButtonElement | null>(null);
  const [folderIsDragSource, setFolderIsDragSource] = useState(false);
  const [folderIsDropTarget, setFolderIsDropTarget] = useState(false);
  const [folderDropIsTarget, setFolderDropIsTarget] = useState(false);
  const [folderDropEdge, setFolderDropEdge] = useState<BookmarkDropEdge | null>(null);
  const canDragFolder = !isRootBookmarkFolder(folder);

  function updateFolderDropIndicator(data: Record<string | symbol, unknown>) {
    setFolderIsDropTarget(true);
    setFolderDropEdge(resolveBookmarkDropEdge(data));
  }

  function clearFolderDropIndicator() {
    setFolderIsDropTarget(false);
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
              flushSync(() => setFolderIsDragSource(true));
            },
            onDragStart: () => setFolderIsDragSource(true),
            onDrop: () => setFolderIsDragSource(false),
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
      onDragEnter: () => setFolderDropIsTarget(true),
      onDragLeave: () => setFolderDropIsTarget(false),
      onDrop: () => setFolderDropIsTarget(false),
    });
  }, [folder, folderDropElement]);

  return {
    folderDrop: {
      isDropTarget: folderDropIsTarget,
      ref: setFolderDropElement,
    },
    folderSort: {
      dropEdge: folderDropEdge,
      handleRef: setHandleElement,
      isDragSource: folderIsDragSource,
      isDropTarget: folderIsDropTarget,
      ref: setFolderElement,
    },
  };
}
