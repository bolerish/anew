import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { act, renderHook } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import { useFolderDnd } from "./useFolderDnd";
import { useItemDnd } from "./useItemDnd";

vi.mock("@atlaskit/pragmatic-drag-and-drop/element/adapter", () => ({
  dropTargetForElements: vi.fn<() => () => void>(() => () => {}),
  draggable: vi.fn<() => () => void>(() => () => {}),
}));

test("self drops remain the innermost target instead of falling through to the parent", () => {
  const item = { id: "item", parentId: "folder", title: "Item", url: "https://example.com" };
  const folder = { id: "folder", parentId: "root", title: "Folder", displayTitle: "Folder", items: [item] };
  const itemHook = renderHook(() =>
    useItemDnd({
      item,
      itemIndex: 0,
      isActive: false,
      isEditing: false,
      onDropIndexChange: vi.fn<(index: number | null) => void>(),
    }),
  );
  act(() => itemHook.result.current.setItemElement(document.createElement("div")));
  const itemTarget = vi.mocked(dropTargetForElements).mock.calls.at(-1)![0];
  expect(
    itemTarget.canDrop!({ source: { data: { kind: "item", item } } } as unknown as Parameters<
      NonNullable<typeof itemTarget.canDrop>
    >[0]),
  ).toBe(true);
  const folderHook = renderHook(() => useFolderDnd(folder));
  act(() => folderHook.result.current.sort.ref(document.createElement("section")));
  const folderTarget = vi.mocked(dropTargetForElements).mock.calls.at(-1)![0];
  expect(folderTarget.getIsSticky?.({} as Parameters<NonNullable<typeof folderTarget.getIsSticky>>[0])).toBe(true);
  expect(itemTarget.getIsSticky?.({} as Parameters<NonNullable<typeof itemTarget.getIsSticky>>[0])).toBe(true);
  expect(
    folderTarget.canDrop!({ source: { data: { kind: "folder", folder } } } as unknown as Parameters<
      NonNullable<typeof folderTarget.canDrop>
    >[0]),
  ).toBe(true);
  const selfDrag = {
    source: { data: { kind: "folder", folder } },
    self: { data: { edge: "after" } },
  } as unknown as Parameters<NonNullable<typeof folderTarget.onDrag>>[0];
  act(() => folderTarget.onDragEnter?.(selfDrag));
  expect(folderHook.result.current.sort.dropEdge).toBeNull();
  act(() => folderTarget.onDrag?.(selfDrag));
  expect(folderHook.result.current.sort.dropEdge).toBeNull();
  act(() => folderTarget.onDrop?.(selfDrag));
  expect(folderHook.result.current.sort.dropEdge).toBeNull();
});

test("original position highlights only while the pointer is inside it", () => {
  const item = { id: "item", parentId: "folder", title: "Item", url: "https://example.com" };
  const folder = { id: "folder", parentId: "root", title: "Folder", displayTitle: "Folder", items: [item] };
  const { result } = renderHook(() => useFolderDnd(folder));
  const element = document.createElement("section");
  element.getBoundingClientRect = () => new DOMRect(10, 20, 100, 60);
  act(() => {
    result.current.sort.ref(element);
    result.current.sort.handleRef(document.createElement("button"));
  });
  const source = vi.mocked(draggable).mock.calls.at(-1)![0];
  function move(clientX: number, clientY: number) {
    act(() =>
      source.onDrag?.({ location: { current: { input: { clientX, clientY } } } } as Parameters<
        NonNullable<typeof source.onDrag>
      >[0]),
    );
  }
  move(50, 40);
  expect(result.current.sort.isSelfDrop).toBe(true);
  move(50, 90);
  expect(result.current.sort.isSelfDrop).toBe(false);
  move(50, 40);
  expect(result.current.sort.isSelfDrop).toBe(true);
  act(() => source.onDrop?.({} as Parameters<NonNullable<typeof source.onDrop>>[0]));
  expect(result.current.sort.isSelfDrop).toBe(false);
});
