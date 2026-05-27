import { useEffect, useMemo } from "react";

import type { BookmarkContextValue } from "../bookmark-provider";

type UseBookmarkKeyboardNavigationInput = Pick<
  BookmarkContextValue,
  "activeBookmark" | "inlineTitle" | "setActiveBookmark" | "visibleFolders"
>;

export function useBookmarkKeyboardNavigation({
  activeBookmark,
  inlineTitle,
  setActiveBookmark,
  visibleFolders,
}: UseBookmarkKeyboardNavigationInput) {
  const keyboardItems = useMemo(() => visibleFolders.flatMap((folder) => folder.items), [visibleFolders]);

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
        if (!inlineTitle.inlineEditingBookmark && activeBookmark) {
          event.preventDefault();
          setActiveBookmark(null);
        }
        return;
      }

      if (isKeyboardShortcutTarget(event.target)) {
        return;
      }

      if (inlineTitle.inlineEditingBookmark || keyboardItems.length === 0) {
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
        inlineTitle.openInlineItemEditor(activeItem);
      }
    }

    window.addEventListener("keydown", handleListKeyDown);

    return () => {
      window.removeEventListener("keydown", handleListKeyDown);
    };
  }, [activeBookmark, inlineTitle, keyboardItems, setActiveBookmark]);
}

function isKeyboardShortcutTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(target.closest("a, button, input, textarea, select, [contenteditable='true'], [role='button']"));
}
