import type { DragEndEvent } from "@dnd-kit/react";
import { isSortableOperation } from "@dnd-kit/react/sortable";
import { useReducer } from "react";
import { browser } from "wxt/browser";

import type { BookmarkFolder, BookmarkItem } from "../../lib/model";
import { resolveBookmarkDrop } from "../lib/dnd-protocol";
import { type BookmarkDropData, computeBookmarkInsertIndex, computeFolderInsertIndex } from "../lib/drag-drop";
import {
  updateBookmarkFolderBeforeTarget,
  updateBookmarkFolderParentIndex,
  updateBookmarkItemBeforeTarget,
  updateBookmarkItemParentIndex,
  updateBookmarkItemFolder,
} from "../lib/mutation";

type UseMovementInput = {
  folders: BookmarkFolder[];
  onBookmarksChange: () => Promise<void>;
  searchIsActive: boolean;
};

type SortableBookmarkMove = {
  group: string;
  renderedIndex: number;
};

type BookmarkMoveExpectation = {
  id: string;
  insertIndex?: number;
  kind: "folder" | "item";
  parentId?: string;
};

export function useBookmarkMovement({ folders, onBookmarksChange, searchIsActive }: UseMovementInput) {
  const [forceReconcileKey, forceReconcile] = useReducer((version: number) => version + 1, 0);

  async function handleDragEnd(event: DragEndEvent) {
    if (searchIsActive) {
      syncSkippedMove(event, "bookmark move skipped while search is active", {
        sortableMove: resolveSortableMove(event),
      });
      return;
    }

    const drop = resolveBookmarkDrop(event);

    if (!drop) {
      logMovement("drop skipped", { canceled: event.canceled });
      return;
    }

    try {
      logMovement("drop received", {
        ...drop,
        folders: deriveFolderSnapshots(folders),
        sortableMove: resolveSortableMove(event),
      });

      if (drop.dragged.kind === "folder") {
        await handleFolderDrop(drop.dragged.folder, drop.target, event);
        return;
      }

      await handleItemDrop(drop.dragged.item, drop.target, event);
    } catch (error) {
      console.error("[newtab:movement] failed to persist bookmark move", {
        error,
        folders: deriveFolderSnapshots(folders),
        sortableMove: resolveSortableMove(event),
      });
    }
  }

  async function handleFolderDrop(folder: BookmarkFolder, target: BookmarkDropData, event: DragEndEvent) {
    const sortableMove = resolveSortableMove(event);

    switch (target.kind) {
      case "folder": {
        if (folder.id === target.folder.id) {
          if (sortableMove && !isSameRenderedFolderPosition(folder, sortableMove.group, sortableMove.renderedIndex)) {
            await updateFolderFromRenderedIndex(folder, sortableMove, event);
            return;
          }

          syncSkippedMove(event, "folder move skipped because target is source", {
            folderId: folder.id,
            sortableMove,
            targetId: target.folder.id,
          });
          return;
        }

        const insertIndex = computeFolderInsertIndex(target.folder);

        logMovement("move folder before target", {
          folderId: folder.id,
          insertIndex,
          parentId: target.folder.parentId,
          targetId: target.folder.id,
        });

        await syncBookmarkMove(() => updateBookmarkFolderBeforeTarget(folder, target.folder, insertIndex), {
          id: folder.id,
          insertIndex,
          kind: "folder",
          parentId: target.folder.parentId,
        });
        return;
      }
      case "item":
      case "item-start": {
        if (sortableMove) {
          await updateFolderFromRenderedIndex(folder, sortableMove, event);
        }
      }
    }
  }

  async function handleItemDrop(item: BookmarkItem, target: BookmarkDropData, event: DragEndEvent) {
    const sortableMove = resolveSortableMove(event);

    switch (target.kind) {
      case "item-start":
        await updateItemToStart(item, target.parentId, event);
        return;
      case "folder":
        logMovement("move item to folder", {
          itemId: item.id,
          parentId: target.folder.id,
          targetId: target.folder.id,
        });

        await syncBookmarkMove(() => updateBookmarkItemFolder(item, target.folder), {
          id: item.id,
          kind: "item",
          parentId: target.folder.id,
        });
        return;
      case "item": {
        if (item.id === target.item.id) {
          if (sortableMove && !isSameRenderedItemPosition(item, sortableMove.group, sortableMove.renderedIndex)) {
            await updateItemFromRenderedIndex(item, sortableMove, event);
            return;
          }

          syncSkippedMove(event, "item move skipped because target is source", {
            itemId: item.id,
            sortableMove,
            targetId: target.item.id,
          });
          return;
        }

        const insertIndex = computeBookmarkInsertIndex(folders, target.item);

        logMovement("move item before target", {
          insertIndex,
          itemId: item.id,
          items: deriveFolderItemSnapshots(target.item.parentId, folders),
          parentId: target.item.parentId,
          targetId: target.item.id,
        });

        await syncBookmarkMove(() => updateBookmarkItemBeforeTarget(item, target.item, insertIndex), {
          id: item.id,
          insertIndex,
          kind: "item",
          parentId: target.item.parentId,
        });
      }
    }
  }

  async function updateFolderFromRenderedIndex(
    folder: BookmarkFolder,
    sortableMove: SortableBookmarkMove,
    event: DragEndEvent,
  ) {
    const insertIndex = computeFolderInsertIndexFromRenderedIndex(
      folder,
      sortableMove.group,
      sortableMove.renderedIndex,
    );

    if (insertIndex === null) {
      reportBookmarkMoveMismatch("folder move skipped because rendered target is missing", {
        folderId: folder.id,
        folders: deriveFolderSnapshots(folders),
        sortableMove,
      });
      return;
    }

    if (isSameRenderedFolderPosition(folder, sortableMove.group, sortableMove.renderedIndex)) {
      syncSkippedMove(event, "folder move skipped because position is unchanged", {
        folderId: folder.id,
        sortableMove,
      });
      return;
    }

    logMovement("move folder from rendered index", {
      folderId: folder.id,
      folders: deriveFolderSnapshots(folders),
      insertIndex,
      parentId: sortableMove.group,
      sortableMove,
    });

    await syncBookmarkMove(
      () =>
        updateBookmarkFolderParentIndex(folder, {
          insertIndex,
          parentId: sortableMove.group,
        }),
      {
        id: folder.id,
        insertIndex,
        kind: "folder",
        parentId: sortableMove.group,
      },
    );
  }

  async function updateItemFromRenderedIndex(
    item: BookmarkItem,
    sortableMove: SortableBookmarkMove,
    event: DragEndEvent,
  ) {
    const insertIndex = computeItemInsertIndexFromRenderedIndex(item, sortableMove.group, sortableMove.renderedIndex);

    if (insertIndex === null) {
      reportBookmarkMoveMismatch("item move skipped because rendered target is missing", {
        itemId: item.id,
        items: deriveFolderItemSnapshots(sortableMove.group, folders),
        sortableMove,
      });
      return;
    }

    if (isSameRenderedItemPosition(item, sortableMove.group, sortableMove.renderedIndex)) {
      syncSkippedMove(event, "item move skipped because position is unchanged", {
        itemId: item.id,
        sortableMove,
      });
      return;
    }

    logMovement("move item from rendered index", {
      insertIndex,
      itemId: item.id,
      items: deriveFolderItemSnapshots(sortableMove.group, folders),
      parentId: sortableMove.group,
      sortableMove,
    });

    await syncBookmarkMove(
      () =>
        updateBookmarkItemParentIndex(item, {
          insertIndex,
          parentId: sortableMove.group,
        }),
      {
        id: item.id,
        insertIndex,
        kind: "item",
        parentId: sortableMove.group,
      },
    );
  }

  function computeItemInsertIndexFromRenderedIndex(
    item: BookmarkItem,
    parentId: string,
    renderedIndex: number,
  ): number | null {
    const folder = folders.find((candidate) => candidate.id === parentId);

    if (!folder) {
      return null;
    }

    const remainingItems = folder.items.filter((candidate) => candidate.id !== item.id);
    const itemAfterMove = remainingItems[renderedIndex];

    if (itemAfterMove) {
      return computeBookmarkInsertIndex(folders, itemAfterMove);
    }

    const lastItem = remainingItems.at(-1);

    return lastItem?.bookmarkIndex !== undefined ? lastItem.bookmarkIndex + 1 : 0;
  }

  function computeFolderInsertIndexFromRenderedIndex(
    folder: BookmarkFolder,
    parentId: string,
    renderedIndex: number,
  ): number | null {
    const siblingFolders = folders.filter((candidate) => candidate.parentId === parentId);
    const remainingFolders = siblingFolders.filter((candidate) => candidate.id !== folder.id);
    const folderAfterMove = remainingFolders[renderedIndex];

    if (folderAfterMove) {
      return computeFolderInsertIndex(folderAfterMove);
    }

    const lastFolder = remainingFolders.at(-1);

    return lastFolder?.bookmarkIndex !== undefined ? lastFolder.bookmarkIndex + 1 : 0;
  }

  function isSameRenderedItemPosition(item: BookmarkItem, parentId: string, renderedIndex: number): boolean {
    const folder = folders.find((candidate) => candidate.id === item.parentId);

    if (!folder) {
      return false;
    }

    return (
      item.parentId === parentId && folder.items.findIndex((candidate) => candidate.id === item.id) === renderedIndex
    );
  }

  function isSameRenderedFolderPosition(folder: BookmarkFolder, parentId: string, renderedIndex: number): boolean {
    const siblingFolders = folders.filter((candidate) => candidate.parentId === folder.parentId);

    return (
      folder.parentId === parentId &&
      siblingFolders.findIndex((candidate) => candidate.id === folder.id) === renderedIndex
    );
  }

  async function updateItemToStart(item: BookmarkItem, parentId: string, event: DragEndEvent) {
    if (item.parentId === parentId && resolveRenderedItemIndex(item) === 0) {
      syncSkippedMove(event, "item move skipped because it is already first", {
        itemId: item.id,
        parentId,
      });
      return;
    }

    logMovement("move item to start", {
      insertIndex: 0,
      itemId: item.id,
      items: deriveFolderItemSnapshots(parentId, folders),
      parentId,
    });

    await syncBookmarkMove(
      () =>
        updateBookmarkItemParentIndex(item, {
          insertIndex: 0,
          parentId,
        }),
      {
        id: item.id,
        insertIndex: 0,
        kind: "item",
        parentId,
      },
    );
  }

  function resolveRenderedItemIndex(item: BookmarkItem): number {
    const folder = folders.find((candidate) => candidate.id === item.parentId);

    return folder?.items.findIndex((candidate) => candidate.id === item.id) ?? -1;
  }

  async function syncBookmarkMove(
    updateBookmark: () => Promise<void>,
    expectedMove: BookmarkMoveExpectation,
  ): Promise<void> {
    const before = expectedMove.parentId ? await fetchBookmarkChildrenSnapshot(expectedMove.parentId) : [];

    await updateBookmark();

    const after = expectedMove.parentId ? await fetchBookmarkChildrenSnapshot(expectedMove.parentId) : [];
    const actualIndex = after.findIndex((child) => child.id === expectedMove.id);
    const expectedFinalIndex = computeExpectedFinalIndex(before, expectedMove);

    if (actualIndex < 0 || (expectedFinalIndex !== null && actualIndex !== expectedFinalIndex)) {
      reportBookmarkMoveMismatch("bookmark move persisted at unexpected position", {
        actualIndex,
        after,
        before,
        expectedFinalIndex,
        expectedMove,
        folders: deriveFolderSnapshots(folders),
      });
    } else {
      logMovement("bookmark move persisted", {
        actualIndex,
        after,
        before,
        expectedFinalIndex,
        expectedMove,
      });
    }

    await onBookmarksChange();
  }

  function syncSkippedMove(event: DragEndEvent, message: string, debugData: unknown) {
    forceReconcile();
    // dnd-kit may keep its internal sortable projection after a skipped drop.
    // The runtime event can expose preventDefault even though DragEndEvent does not type it.
    const preventDefault = (event as DragEndEvent & { preventDefault?: () => void }).preventDefault;

    if (preventDefault) {
      preventDefault();
    }

    logMovement(message, debugData);
  }

  return { forceReconcileKey, handleDragEnd };
}

function computeExpectedFinalIndex(
  before: BookmarkChildSnapshot[],
  expectedMove: BookmarkMoveExpectation,
): number | null {
  if (expectedMove.insertIndex === undefined) {
    return null;
  }

  const previousIndex = before.findIndex((child) => child.id === expectedMove.id);

  if (previousIndex >= 0 && previousIndex < expectedMove.insertIndex) {
    // Chrome removes the bookmark before inserting it. In the same parent,
    // moving forward shifts the effective target index left by one.
    return expectedMove.insertIndex - 1;
  }

  return expectedMove.insertIndex;
}

function resolveSortableMove(event: DragEndEvent): SortableBookmarkMove | null {
  if (!isSortableOperation(event.operation)) {
    return null;
  }

  const sortable = event.operation.source?.sortable;

  if (!sortable || typeof sortable.group !== "string") {
    return null;
  }

  if (!Number.isInteger(sortable.index) || sortable.index < 0) {
    return null;
  }

  return { group: sortable.group, renderedIndex: sortable.index };
}

async function fetchBookmarkChildrenSnapshot(parentId: string): Promise<BookmarkChildSnapshot[]> {
  const children = await browser.bookmarks.getChildren(parentId);

  return children.map((child) => ({
    id: child.id,
    index: child.index,
    parentId: child.parentId,
    title: child.title,
    url: child.url,
  }));
}

function logMovement(message: string, debugData: unknown) {
  if (!import.meta.env.DEV) {
    return;
  }

  console.debug(`[newtab:movement] ${message}`, debugData);
}

function reportBookmarkMoveMismatch(message: string, debugData: unknown) {
  if (!import.meta.env.DEV) {
    return;
  }

  console.error(`[newtab:movement] ${message}`, debugData);
}

function deriveFolderSnapshots(folders: BookmarkFolder[]): BookmarkFolderSnapshot[] {
  return folders.map((folder) => ({
    bookmarkIndex: folder.bookmarkIndex,
    id: folder.id,
    items: folder.items.map((item) => ({
      bookmarkIndex: item.bookmarkIndex,
      id: item.id,
      parentId: item.parentId,
      title: item.title,
    })),
    parentId: folder.parentId,
    title: folder.title,
  }));
}

function deriveFolderItemSnapshots(parentId: string, folders: BookmarkFolder[]): BookmarkItemSnapshot[] {
  return (
    folders
      .find((folder) => folder.id === parentId)
      ?.items.map((item) => ({
        bookmarkIndex: item.bookmarkIndex,
        id: item.id,
        parentId: item.parentId,
        title: item.title,
      })) ?? []
  );
}

type BookmarkChildSnapshot = {
  id: string;
  index?: number;
  parentId?: string;
  title: string;
  url?: string;
};

type BookmarkFolderSnapshot = {
  bookmarkIndex?: number;
  id: string;
  items: BookmarkItemSnapshot[];
  parentId?: string;
  title: string;
};

type BookmarkItemSnapshot = {
  bookmarkIndex?: number;
  id: string;
  parentId: string;
  title: string;
};
