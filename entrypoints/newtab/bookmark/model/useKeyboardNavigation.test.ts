import { renderHook, fireEvent } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import type { InlineEditingBookmark } from "./types";
import { useEditor } from "./useEditor";
import { useKeyboardNavigation } from "./useKeyboardNavigation";
import { isKeyboardShortcutTarget } from "./useKeyboardNavigation";
test.each(["separator", "slider", "combobox", "toolbar", "menu", "dialog"])("protects %s keyboard controls", (role) => {
  const parent = document.createElement("div");
  parent.setAttribute("role", role);
  const button = document.createElement("button");
  parent.append(button);
  expect(isKeyboardShortcutTarget(button, true)).toBe(true);
});

test("arrows skip collapsed items and move across adjacent columns", () => {
  const selected = vi.fn<() => void>();
  document.body.innerHTML =
    '<div><div data-bookmark-column="0"><div id="bookmark-left"><a href="#">Left</a></div></div><div data-bookmark-column="1"><div id="bookmark-right"><a href="#">Right</a></div></div></div>';
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockImplementation(function (this: HTMLElement) {
    return (this.id === "bookmark-hidden" ? [] : [new DOMRect(0, 0, 10, 10)]) as unknown as DOMRectList;
  });
  const items = ["hidden", "left", "right"].map((id) => ({
    id,
    title: id,
    url: "https://example.com",
    parentId: "folder",
  }));
  const folder = { id: "folder", title: "Folder", displayTitle: "Folder", items };
  const { rerender } = renderHook(
    ({ activeBookmark }: { activeBookmark: InlineEditingBookmark | null }) => {
      const editor = useEditor();
      useKeyboardNavigation({
        isEditMode: false,
        activeBookmark,
        editor,
        setActiveBookmark: selected,
        visibleFolders: [folder],
      });
    },
    { initialProps: { activeBookmark: null as InlineEditingBookmark | null } },
  );
  fireEvent.keyDown(document.body, { key: "ArrowDown" });
  expect(selected).toHaveBeenLastCalledWith({ kind: "item", id: "left" });
  rerender({ activeBookmark: { kind: "item", id: "left" } });
  fireEvent.keyDown(document.body, { key: "ArrowRight" });
  expect(selected).toHaveBeenLastCalledWith({ kind: "item", id: "right" });
  document.body.innerHTML = "";
});
