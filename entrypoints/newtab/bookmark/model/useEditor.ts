import { useCallback, useEffect, useRef, useState } from "react";

import { updateItem, updateTitle } from "../api/update";
import { canNormalizeUrl } from "../lib/url";
import { isRootBookmarkFolder, type BookmarkFolder, type BookmarkItem, type InlineEditingBookmark } from "./types";

export function useEditor() {
  const [inlineEditingBookmark, setInlineEditingBookmark] = useState<InlineEditingBookmark | null>(null);
  const [hasSaveError, setHasSaveError] = useState(false);
  const saving = useRef(false);
  const [inlineTitle, setInlineTitle] = useState("");
  const [inlineUrl, setInlineUrl] = useState("");
  const currentInlineEditorRef = useRef<InlineEditingBookmark | null>(null);
  const inlineEditingFolderRef = useRef<BookmarkFolder | null>(null);
  const inlineEditingItemRef = useRef<BookmarkItem | null>(null);
  const cancelInlineEditor = useStableCallback(() => {
    closeInlineEditor();
  });
  const updateCurrentInlineEditor = useStableCallback(async () => {
    const currentInlineEditor = currentInlineEditorRef.current;

    if (!currentInlineEditor || saving.current) {
      return;
    }

    saving.current = true;
    setHasSaveError(false);
    try {
      if (currentInlineEditor.kind === "folder") {
        await updateCurrentFolderTitle(currentInlineEditor);
        return;
      }

      await updateCurrentItem(currentInlineEditor);
    } catch (error) {
      console.error("[min] Could not save bookmark", error);
      if (isSameInlineEditingBookmark(currentInlineEditorRef.current, currentInlineEditor)) setHasSaveError(true);
    } finally {
      saving.current = false;
    }
  });

  useEffect(() => {
    function handleDocumentKeyDown(e: globalThis.KeyboardEvent) {
      if (!currentInlineEditorRef.current) {
        return;
      }

      if (e.isComposing) return;
      if (e.key === "Enter") {
        if (
          !(e.target instanceof Element) ||
          !e.target.closest("[data-inline-bookmark-editor]") ||
          e.target.closest("button")
        )
          return;
        e.preventDefault();
        void updateCurrentInlineEditor();
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        cancelInlineEditor();
      }
    }

    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [cancelInlineEditor, updateCurrentInlineEditor]);

  function openInlineFolderEditor(folder: BookmarkFolder) {
    if (isRootBookmarkFolder(folder)) {
      return;
    }

    setInlineEditingBookmarkState({ kind: "folder", id: folder.id });
    inlineEditingFolderRef.current = folder;
    inlineEditingItemRef.current = null;
    setInlineTitle(folder.title);
    setInlineUrl("");
  }

  function openInlineItemEditor(item: BookmarkItem) {
    setInlineEditingBookmarkState({ kind: "item", id: item.id });
    inlineEditingFolderRef.current = null;
    inlineEditingItemRef.current = item;
    setInlineTitle(item.title);
    setInlineUrl(item.url);
  }

  async function updateCurrentFolderTitle(currentInlineEditor: InlineEditingBookmark) {
    const folder = inlineEditingFolderRef.current;

    if (!folder || currentInlineEditor.kind !== "folder" || currentInlineEditor.id !== folder.id) {
      return;
    }

    const title = inlineTitle.trim();

    if (!title) {
      closeInlineEditorIfCurrent(currentInlineEditor);
      return;
    }

    await updateTitle(currentInlineEditor.id, title);
    closeInlineEditorIfCurrent(currentInlineEditor);
  }

  async function updateCurrentItem(currentInlineEditor: InlineEditingBookmark) {
    const item = inlineEditingItemRef.current;

    if (!item || currentInlineEditor.kind !== "item" || currentInlineEditor.id !== item.id) {
      return;
    }

    const title = inlineTitle.trim();
    const url = inlineUrl.trim();

    if (!canNormalizeUrl(url)) {
      return;
    }

    await updateItem(item, {
      title: title || item.title,
      url,
    });
    closeInlineEditorIfCurrent(currentInlineEditor);
  }

  function closeInlineEditor() {
    const current = currentInlineEditorRef.current;
    const prefix = current?.kind === "item" ? "bookmark" : "folder";
    const targetId = current ? `${prefix}-${current.id}` : null;
    setInlineEditingBookmarkState(null);
    inlineEditingFolderRef.current = null;
    inlineEditingItemRef.current = null;
    setInlineTitle("");
    setInlineUrl("");
    if (targetId)
      requestAnimationFrame(() => {
        document
          .getElementById(targetId)
          ?.querySelector<HTMLElement>("a[href], button")
          ?.focus({ preventScroll: true });
      });
  }

  function setInlineEditingBookmarkState(bookmark: InlineEditingBookmark | null) {
    setHasSaveError(false);
    currentInlineEditorRef.current = bookmark;
    setInlineEditingBookmark(bookmark);
  }

  function closeInlineEditorIfCurrent(bookmark: InlineEditingBookmark) {
    if (!isSameInlineEditingBookmark(currentInlineEditorRef.current, bookmark)) {
      return;
    }

    closeInlineEditor();
  }

  return {
    hasSaveError,
    cancelInlineEditor,
    openInlineFolderEditor,
    openInlineItemEditor,
    inlineEditingBookmark,
    inlineTitle,
    inlineUrl,
    updateCurrentInlineEditor,
    setInlineTitle,
    setInlineUrl,
  };
}

function isSameInlineEditingBookmark(left: InlineEditingBookmark | null, right: InlineEditingBookmark): boolean {
  return left?.kind === right.kind && left.id === right.id;
}

function useStableCallback<Args extends unknown[], Result>(callback: (...args: Args) => Result) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback((...args: Args) => callbackRef.current(...args), []);
}
