import { useState, type SubmitEvent, type MouseEvent, type PointerEvent } from "react";
import { stopInteraction } from "~shared/lib/event";

import { canNormalizeUrl } from "../lib/url";
import { useBookmarkContext } from "./Provider";
import type { BookmarkItem, InlineEditingBookmark } from "./types";

export function useItemEdit(item: BookmarkItem) {
  const { editor } = useBookmarkContext();
  const [suppressActions, setSuppressActions] = useState(false);
  const isEditing = isInlineEditingItem(editor.inlineEditingBookmark, item);
  const isUrlValid = !isEditing || canNormalizeUrl(editor.inlineUrl);

  function openEditor(event: MouseEvent<HTMLElement> | PointerEvent<HTMLElement>) {
    stopInteraction(event);
    setSuppressActions(true);
    editor.openInlineItemEditor(item);
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    await editor.updateCurrentInlineEditor();
  }

  function showActions() {
    setSuppressActions(false);
  }

  return {
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
