import { monitorForElements, type ElementEventBasePayload } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { act, renderHook } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { browser } from "wxt/browser";

import type { DropData, DropEdge } from "../lib/dnd";
import { beginEditing, cancelEditing, getEditSession, saveEditing } from "./edit-session";
import type { BookmarkFolder, BookmarkItem, BookmarkTreeNode } from "./types";
import { useDndMove } from "./useDndMove";

vi.mock("@atlaskit/pragmatic-drag-and-drop/element/adapter", () => ({
  monitorForElements: vi.fn<() => () => void>(() => () => {}),
}));

const items: BookmarkItem[] = ["a", "b", "c"].map((id, bookmarkIndex) => ({
  id,
  parentId: "folder",
  title: id,
  url: `https://${id}.example`,
  bookmarkIndex,
}));
const folder: BookmarkFolder = { id: "folder", parentId: "1", title: "Folder", displayTitle: "Folder", items };

function dropEvent(item: BookmarkItem, target?: DropData): ElementEventBasePayload {
  const element = document.createElement("div");
  const current: ElementEventBasePayload["location"]["current"] = {
    input: {
      altKey: false,
      button: 0,
      buttons: 0,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      clientX: 0,
      clientY: 0,
      pageX: 0,
      pageY: 0,
    },
    dropTargets: target ? [{ element, data: target, dropEffect: "move", isActiveDueToStickiness: false }] : [],
  };
  return {
    source: { element, dragHandle: null, data: { kind: "item", item } },
    location: { initial: current, current, previous: { dropTargets: [] } },
  };
}

const cases: { source: number; target: number; edge: DropEdge; index: number | null }[] = [
  { source: 0, target: 1, edge: "after", index: 2 },
  { source: 0, target: 2, edge: "after", index: 3 },
  { source: 2, target: 0, edge: "before", index: 0 },
  { source: 2, target: 1, edge: "before", index: 1 },
  { source: 1, target: 0, edge: "after", index: null },
  { source: 1, target: 2, edge: "before", index: null },
  { source: 1, target: 1, edge: "before", index: null },
];

test.each(cases)(
  "same-folder drop $source $edge $target sends index $index",
  async ({ source, target, edge, index }) => {
    const move = vi.spyOn(browser.bookmarks, "move").mockResolvedValue(undefined);
    const onBookmarksChange = vi.fn<() => Promise<void>>(async () => {});
    renderHook(() => useDndMove({ folders: [folder], isSearchActive: false, onBookmarksChange }));
    const monitor = vi.mocked(monitorForElements).mock.calls.at(-1)![0];
    await act(async () => {
      await monitor.onDrop?.(dropEvent(items[source], { kind: "item", item: items[target], edge }));
    });
    const expectedMoves = index === null ? [] : [[items[source].id, { parentId: "folder", index }]];
    expect(move.mock.calls).toEqual(expectedMoves);
    expect(onBookmarksChange).toHaveBeenCalledTimes(index === null ? 0 : 1);
  },
);

test("cancelling a drag sends no move or refresh", async () => {
  const move = vi.spyOn(browser.bookmarks, "move");
  const onBookmarksChange = vi.fn<() => Promise<void>>(async () => {});
  renderHook(() => useDndMove({ folders: [folder], isSearchActive: false, onBookmarksChange }));
  const monitor = vi.mocked(monitorForElements).mock.calls.at(-1)![0];
  await act(async () => {
    await monitor.onDrop?.(dropEvent(items[0]));
  });
  expect(move).not.toHaveBeenCalled();
  expect(onBookmarksChange).not.toHaveBeenCalled();
});

test("same-folder drop previews, cancels, then saves the same order on re-read", async () => {
  const tree: BookmarkTreeNode[] = [
    {
      id: folder.id,
      title: folder.title,
      children: items.map(({ bookmarkIndex, ...item }) => ({ ...item, index: bookmarkIndex })),
    },
  ];
  vi.spyOn(browser.bookmarks, "getTree").mockImplementation(async () => structuredClone(tree));
  const move = vi.spyOn(browser.bookmarks, "move").mockImplementation(async (id, input) => {
    const children = tree[0].children!;
    const sourceIndex = children.findIndex((item) => item.id === id);
    let index = input.index ?? children.length;
    if (sourceIndex < index) index--;
    const [item] = children.splice(sourceIndex, 1);
    children.splice(index, 0, item);
    children.forEach((child, position) => (child.index = position));
  });
  const settings = { folderViews: {}, layouts: {}, defaultView: "list", initialColumns: 1 } as const;
  const onBookmarksChange = vi.fn<() => Promise<void>>(async () => {});
  renderHook(() => useDndMove({ folders: [folder], isSearchActive: false, onBookmarksChange }));
  const monitor = vi.mocked(monitorForElements).mock.calls.at(-1)![0];
  const event = dropEvent(items[0], { kind: "item", item: items[2], edge: "after" });
  try {
    await beginEditing(settings);
    await act(async () => {
      await monitor.onDrop?.(event);
    });
    expect(getEditSession().draft!.tree[0].children!.map((item) => item.id)).toEqual(["b", "c", "a"]);
    expect(move).not.toHaveBeenCalled();
    cancelEditing();
    expect((await browser.bookmarks.getTree())[0].children!.map((item) => item.id)).toEqual(["a", "b", "c"]);

    await beginEditing(settings);
    await act(async () => {
      await monitor.onDrop?.(event);
    });
    await saveEditing(async () => {});
    expect(move).toHaveBeenCalledExactlyOnceWith("a", { parentId: "folder", index: 3 });
    expect((await browser.bookmarks.getTree())[0].children!.map((item) => item.id)).toEqual(["b", "c", "a"]);
  } finally {
    cancelEditing();
  }
});
