import { useCallback, useEffect, useRef, useState } from "react";

import {
  isRootBookmarkFolder,
  type BookmarkFolder,
  type BookmarkItem,
  type InlineEditingBookmark,
} from "../../lib/model";
import { canNormalizeUrl } from "../../lib/url";
import { updateBookmarkTitle, updateBookmarkItem } from "../lib/mutation";

export function useInlineTitle() {
  const [inlineEditingBookmark, setInlineEditingBookmark] = useState<InlineEditingBookmark | null>(null);
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

    if (!currentInlineEditor) {
      return;
    }

    if (currentInlineEditor.kind === "folder") {
      await updateCurrentFolderTitle(currentInlineEditor);
      return;
    }

    await updateCurrentItem(currentInlineEditor);
  });

  useEffect(() => {
    function handleDocumentPointerDown(event: PointerEvent) {
      if (!currentInlineEditorRef.current) {
        return;
      }

      if (isInsideInlineEditor(event.target)) {
        return;
      }

      cancelInlineEditor();
    }

    function handleDocumentKeyDown(event: globalThis.KeyboardEvent) {
      if (!currentInlineEditorRef.current) {
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        void updateCurrentInlineEditor();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        cancelInlineEditor();
      }
    }

    document.addEventListener("pointerdown", handleDocumentPointerDown);
    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
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

    await updateBookmarkTitle(currentInlineEditor.id, title);
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

    await updateBookmarkItem(item, {
      title: title || item.title,
      url,
    });
    closeInlineEditorIfCurrent(currentInlineEditor);
  }

  function closeInlineEditor() {
    setInlineEditingBookmarkState(null);
    inlineEditingFolderRef.current = null;
    inlineEditingItemRef.current = null;
    setInlineTitle("");
    setInlineUrl("");
    resetActiveElementFocus();
  }

  function setInlineEditingBookmarkState(bookmark: InlineEditingBookmark | null) {
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

function isInsideInlineEditor(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest("[data-inline-bookmark-editor]"));
}

function resetActiveElementFocus() {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

function useStableCallback<Args extends unknown[], Result>(callback: (...args: Args) => Result) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback((...args: Args) => callbackRef.current(...args), []);
}
