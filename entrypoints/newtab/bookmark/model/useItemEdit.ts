import { useCallback, useState, type FocusEvent, type FormEvent, type MouseEvent } from "react";
import { stopInteraction } from "~shared/lib/event";

import { canNormalizeUrl } from "../lib/url";
import { useBookmarkContext } from "./Provider";
import type { BookmarkItem, InlineEditingBookmark } from "./types";

export function useItemEdit(item: BookmarkItem) {
  const { editor } = useBookmarkContext();
  const [suppressActions, setSuppressActions] = useState(false);
  const isEditing = isInlineEditingItem(editor.inlineEditingBookmark, item);
  const isUrlValid = !isEditing || canNormalizeUrl(editor.inlineUrl);

  const openEditor = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      stopInteraction(event);
      setSuppressActions(true);
      editor.openInlineItemEditor(item);
    },
    [editor, item],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await editor.updateCurrentInlineEditor();
  }

  function handleBlur(event: FocusEvent<HTMLFormElement>) {
    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }

    editor.cancelInlineEditor();
  }

  const showActions = useCallback(() => {
    setSuppressActions(false);
  }, []);

  return {
    handleBlur,
    handleSubmit,
    editor,
    isUrlValid,
    isEditing,
    openEditor,
    showActions,
    suppressActions,
  };
}

function isInlineEditingItem(inlineEditingBookmark: InlineEditingBookmark | null, item: BookmarkItem): boolean {
  return inlineEditingBookmark?.kind === "item" && inlineEditingBookmark.id === item.id;
}
