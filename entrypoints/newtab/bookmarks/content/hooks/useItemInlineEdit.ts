import { useCallback, useState, type FocusEvent, type FormEvent, type MouseEvent } from "react";
import { stopInteraction } from "~newtab/shared/lib/event";

import type { BookmarkItem, InlineEditingBookmark } from "../../lib/model";
import { canNormalizeUrl } from "../../lib/url";
import { useBookmarkContext } from "../bookmark-provider";

export function useItemInlineEdit(item: BookmarkItem) {
  const { inlineTitle } = useBookmarkContext();
  const [suppressBookmarkActions, setSuppressBookmarkActions] = useState(false);
  const isEditing = isInlineEditingItem(inlineTitle.inlineEditingBookmark, item);
  const inlineUrlIsValid = !isEditing || canNormalizeUrl(inlineTitle.inlineUrl);

  const openItemEditor = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      stopInteraction(event);
      setSuppressBookmarkActions(true);
      inlineTitle.openInlineItemEditor(item);
    },
    [inlineTitle, item],
  );

  async function handleItemSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await inlineTitle.updateCurrentInlineEditor();
  }

  function handleItemBlur(event: FocusEvent<HTMLFormElement>) {
    const nextTarget = event.relatedTarget;

    if (isNode(nextTarget) && event.currentTarget.contains(nextTarget)) {
      return;
    }

    inlineTitle.cancelInlineEditor();
  }

  const revealBookmarkActions = useCallback(() => {
    setSuppressBookmarkActions(false);
  }, []);

  return {
    handleItemBlur,
    handleItemSubmit,
    inlineTitle,
    inlineUrlIsValid,
    isEditing,
    openItemEditor,
    revealBookmarkActions,
    suppressBookmarkActions,
  };
}

function isInlineEditingItem(inlineEditingBookmark: InlineEditingBookmark | null, item: BookmarkItem): boolean {
  return inlineEditingBookmark?.kind === "item" && inlineEditingBookmark.id === item.id;
}

function isNode(value: EventTarget | null): value is Node {
  return value instanceof Node;
}
