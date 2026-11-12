import { useEffect } from "react";

import type { BookmarkContextValue } from "./Provider";

type UseBookmarkKeyboardNavigationInput = Pick<
  BookmarkContextValue,
  "isEditMode" | "activeBookmark" | "editor" | "setActiveBookmark" | "visibleFolders"
>;

export function useKeyboardNavigation({
  isEditMode,
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
    function handleListKeyDown(e: globalThis.KeyboardEvent) {
      if (e.defaultPrevented || e.isComposing) return;
      if (e.key === "Escape" && isKeyboardShortcutTarget(e.target, true)) return;
      if (e.key === "Escape") {
        if (!editor.inlineEditingBookmark && activeBookmark) {
          if (!isEditMode) e.preventDefault();
          setActiveBookmark(null);
        }
        return;
      }

      if (
        e.defaultPrevented ||
        e.isComposing ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        isKeyboardShortcutTarget(e.target, e.key.startsWith("Arrow"))
      ) {
        return;
      }

      const navigationItems = keyboardItems.filter(
        (item) => document.getElementById(`bookmark-${item.id}`)?.getClientRects().length,
      );
      if (editor.inlineEditingBookmark || navigationItems.length === 0) {
        return;
      }

      const activeItemIndex =
        activeBookmark?.kind === "item" ? navigationItems.findIndex((item) => item.id === activeBookmark.id) : -1;

      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const current =
          activeItemIndex >= 0 ? document.getElementById(`bookmark-${navigationItems[activeItemIndex].id}`) : null;
        const column = current?.closest("[data-bookmark-column]");
        if (!current || !column?.parentElement) return;
        const columns = [...column.parentElement.querySelectorAll(":scope > [data-bookmark-column]")];
        const destination = columns[columns.indexOf(column) + (e.key === "ArrowRight" ? 1 : -1)];
        if (!destination) return;
        const top = current.getBoundingClientRect().top;
        let nearest = null;
        let distance = Infinity;
        for (const item of navigationItems) {
          const element = document.getElementById(`bookmark-${item.id}`);
          if (!element || !destination.contains(element)) continue;
          const delta = Math.abs(element.getBoundingClientRect().top - top);
          if (delta < distance) {
            distance = delta;
            nearest = item;
          }
        }
        if (nearest) {
          e.preventDefault();
          setActiveBookmark({ kind: "item", id: nearest.id });
          document.getElementById(`bookmark-${nearest.id}`)?.querySelector<HTMLAnchorElement>("a[href]")?.focus();
        }
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = activeItemIndex < 0 ? 0 : Math.min(navigationItems.length - 1, activeItemIndex + 1);
        const item = navigationItems[nextIndex];
        setActiveBookmark({ kind: "item", id: item.id });
        document.getElementById(`bookmark-${item.id}`)?.querySelector<HTMLAnchorElement>("a[href]")?.focus();
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        const nextIndex = activeItemIndex < 0 ? navigationItems.length - 1 : Math.max(0, activeItemIndex - 1);
        const item = navigationItems[nextIndex];
        setActiveBookmark({ kind: "item", id: item.id });
        document.getElementById(`bookmark-${item.id}`)?.querySelector<HTMLAnchorElement>("a[href]")?.focus();
        return;
      }

      const activeItem = activeItemIndex >= 0 ? navigationItems[activeItemIndex] : null;

      if (e.key === "Enter" && activeItem) {
        e.preventDefault();
        if (isEditMode) editor.openInlineItemEditor(activeItem);
        else globalThis.location.assign(activeItem.url);
        return;
      }
    }

    window.addEventListener("keydown", handleListKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleListKeyDown, true);
    };
  }, [isEditMode, activeBookmark, editor, keyboardItems, setActiveBookmark]);
}

export function isKeyboardShortcutTarget(target: EventTarget | null, allowButtons = false): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const protectedControl = target.closest(
    "input, textarea, select, [contenteditable]:not([contenteditable='false']), [data-bookmark-resize], [role='slider'], [role='separator'], [role='combobox'], [role='tablist'], [role='toolbar'], [role='dialog'], [role='listbox'], [role='menu'], [role='menubar'], [role='switch']",
  );
  return Boolean(protectedControl || (!allowButtons && target.closest("a, button, [role='button']")));
}
