import { useCallback, useState, type FocusEvent, type FormEvent, type MouseEvent } from "react";
import { stopInteraction } from "~shared/lib/event";

import { canNormalizeUrl } from "../lib/bookmark-url";
import { useBookmarkContext } from "../ui/BookmarkProvider";
import type { BookmarkItem, InlineEditingBookmark } from "./bookmark-model";

export function useItemInlineEdit(item: BookmarkItem) {
  const { inlineEditor } = useBookmarkContext();
  const [suppressBookmarkActions, setSuppressBookmarkActions] = useState(false);
  const isEditing = isInlineEditingItem(inlineEditor.inlineEditingBookmark, item);
  const isInlineUrlValid = !isEditing || canNormalizeUrl(inlineEditor.inlineUrl);

  const openItemEditor = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      stopInteraction(event);
      setSuppressBookmarkActions(true);
      inlineEditor.openInlineItemEditor(item);
    },
    [inlineEditor, item],
  );

  async function handleItemSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await inlineEditor.updateCurrentInlineEditor();
  }

  function handleItemBlur(event: FocusEvent<HTMLFormElement>) {
    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }

    inlineEditor.cancelInlineEditor();
  }

  const revealBookmarkActions = useCallback(() => {
    setSuppressBookmarkActions(false);
  }, []);

  return {
    handleItemBlur,
    handleItemSubmit,
    inlineEditor,
    isInlineUrlValid,
    isEditing,
    openItemEditor,
    revealBookmarkActions,
    suppressBookmarkActions,
  };
}

function isInlineEditingItem(inlineEditingBookmark: InlineEditingBookmark | null, item: BookmarkItem): boolean {
  return inlineEditingBookmark?.kind === "item" && inlineEditingBookmark.id === item.id;
}
