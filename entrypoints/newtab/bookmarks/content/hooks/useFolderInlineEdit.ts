import { useCallback, type FocusEvent, type FormEvent, type MouseEvent } from "react";
import { stopInteraction } from "~newtab/shared/lib/event";

import type { BookmarkFolder, InlineEditingBookmark } from "../../lib/model";
import { useBookmarkContext } from "../bookmark-provider";

export function useFolderInlineEdit(folder: BookmarkFolder) {
  const { inlineTitle } = useBookmarkContext();
  const isEditing = isInlineEditingFolder(inlineTitle.inlineEditingBookmark, folder);

  const openFolderEditor = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      stopInteraction(event);
      inlineTitle.openInlineFolderEditor(folder);
    },
    [folder, inlineTitle],
  );

  async function handleFolderSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await inlineTitle.updateCurrentInlineEditor();
  }

  function handleFolderBlur(event: FocusEvent<HTMLFormElement>) {
    const nextTarget = event.relatedTarget;

    if (isNode(nextTarget) && event.currentTarget.contains(nextTarget)) {
      return;
    }

    inlineTitle.cancelInlineEditor();
  }

  return {
    handleFolderBlur,
    handleFolderSubmit,
    inlineTitle,
    isEditing,
    openFolderEditor,
  };
}

function isInlineEditingFolder(inlineEditingBookmark: InlineEditingBookmark | null, folder: BookmarkFolder): boolean {
  return inlineEditingBookmark?.kind === "folder" && inlineEditingBookmark.id === folder.id;
}

function isNode(value: EventTarget | null): value is Node {
  return value instanceof Node;
}
