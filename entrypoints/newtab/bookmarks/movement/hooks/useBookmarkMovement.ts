import type { ElementEventBasePayload } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { browser } from "wxt/browser";

import type { BookmarkFolder, BookmarkItem } from "../../lib/model";
import { resolveBookmarkDrop } from "../lib/dnd-protocol";
import { type BookmarkDropData, computeBookmarkInsertIndex, computeFolderInsertIndex } from "../lib/drag-drop";
import {
  updateBookmarkFolderBeforeTarget,
  updateBookmarkItemBeforeTarget,
  updateBookmarkItemParentIndex,
  updateBookmarkItemFolder,
} from "../lib/mutation";

type UseMovementInput = {
  folders: BookmarkFolder[];
  onBookmarksChange: () => Promise<void>;
  searchIsActive: boolean;
};

type BookmarkMoveExpectation = {
  id: string;
  insertIndex?: number;
  kind: "folder" | "item";
  parentId?: string;
};

export function useBookmarkMovement({ folders, onBookmarksChange, searchIsActive }: UseMovementInput) {
  async function handleDrop(event: ElementEventBasePayload) {
    if (searchIsActive) {
      logMovement("bookmark move skipped while search is active", null);
      return;
    }

    const drop = resolveBookmarkDrop(event);

    if (!drop) {
      logMovement("drop skipped", null);
      return;
    }

    try {
      logMovement("drop received", {
        ...drop,
        folders: deriveFolderSnapshots(folders),
      });

      if (drop.dragged.kind === "folder") {
        await handleFolderDrop(drop.dragged.folder, drop.target);
        return;
      }

      await handleItemDrop(drop.dragged.item, drop.target);
    } catch (error) {
      console.error("[newtab:movement] failed to persist bookmark move", {
        error,
        folders: deriveFolderSnapshots(folders),
      });
    }
  }

  async function handleFolderDrop(folder: BookmarkFolder, target: BookmarkDropData) {
    switch (target.kind) {
      case "folder": {
        if (folder.id === target.folder.id) {
          logMovement("folder move skipped because target is source", {
            folderId: folder.id,
            targetId: target.folder.id,
          });
          return;
        }

        const insertIndex = computeFolderInsertIndex(target.folder, target.edge);

        logMovement("move folder before target", {
          folderId: folder.id,
          edge: target.edge,
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
      case "item-start":
        return;
    }
  }

  async function handleItemDrop(item: BookmarkItem, target: BookmarkDropData) {
    switch (target.kind) {
      case "item-start":
        await updateItemToStart(item, target.parentId);
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
          logMovement("item move skipped because target is source", {
            itemId: item.id,
            targetId: target.item.id,
          });
          return;
        }

        const insertIndex = computeBookmarkInsertIndex(folders, target.item, target.edge);

        logMovement("move item before target", {
          edge: target.edge,
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

  async function updateItemToStart(item: BookmarkItem, parentId: string) {
    if (item.parentId === parentId && resolveRenderedItemIndex(item) === 0) {
      logMovement("item move skipped because it is already first", {
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

  return { handleDrop };
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
