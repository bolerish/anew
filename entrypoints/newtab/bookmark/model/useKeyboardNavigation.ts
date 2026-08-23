import { useEffect } from "react";

import type { BookmarkContextValue } from "./Provider";

type UseBookmarkKeyboardNavigationInput = Pick<
  BookmarkContextValue,
  "activeBookmark" | "editor" | "setActiveBookmark" | "visibleFolders"
>;

export function useKeyboardNavigation({
  activeBookmark,
  editor,
  setActiveBookmark,
  visibleFolders,
}: UseBookmarkKeyboardNavigationInput) {
  const keyboardItems = visibleFolders.flatMap((folder) => folder.items);

  useEffect(() => {
    if (keyboardItems.length === 0 || activeBookmark?.kind !== "item") {
      return;
    }

    if (!keyboardItems.some((item) => item.id === activeBookmark.id)) {
      setActiveBookmark(null);
    }
  }, [activeBookmark, keyboardItems, setActiveBookmark]);

  useEffect(() => {
    function handleListKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        if (!editor.inlineEditingBookmark && activeBookmark) {
          event.preventDefault();
          setActiveBookmark(null);
        }
        return;
      }

      if (isKeyboardShortcutTarget(event.target)) {
        return;
      }

      if (editor.inlineEditingBookmark || keyboardItems.length === 0) {
        return;
      }

      const activeItemIndex =
        activeBookmark?.kind === "item" ? keyboardItems.findIndex((item) => item.id === activeBookmark.id) : -1;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        const nextIndex = activeItemIndex < 0 ? 0 : Math.min(keyboardItems.length - 1, activeItemIndex + 1);
        setActiveBookmark({ kind: "item", id: keyboardItems[nextIndex].id });
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        const nextIndex = activeItemIndex < 0 ? keyboardItems.length - 1 : Math.max(0, activeItemIndex - 1);
        setActiveBookmark({ kind: "item", id: keyboardItems[nextIndex].id });
        return;
      }

      const activeItem = activeItemIndex >= 0 ? keyboardItems[activeItemIndex] : null;

      if (event.key === "Enter" && activeItem) {
        event.preventDefault();
        globalThis.location.assign(activeItem.url);
        return;
      }

      if (event.code === "KeyE" && activeItem) {
        event.preventDefault();
        editor.openInlineItemEditor(activeItem);
      }
    }

    window.addEventListener("keydown", handleListKeyDown);

    return () => {
      window.removeEventListener("keydown", handleListKeyDown);
    };
  }, [activeBookmark, editor, keyboardItems, setActiveBookmark]);
}

function isKeyboardShortcutTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(target.closest("a, button, input, textarea, select, [contenteditable='true'], [role='button']"));
}
