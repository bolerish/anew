import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
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
  expect(
    folderTarget.canDrop!({ source: { data: { kind: "folder", folder } } } as unknown as Parameters<
      NonNullable<typeof folderTarget.canDrop>
    >[0]),
  ).toBe(true);
});
