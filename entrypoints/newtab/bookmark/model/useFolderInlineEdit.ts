import { useCallback, type FocusEvent, type FormEvent, type MouseEvent } from "react";
import { stopInteraction } from "~shared/lib/event";

import { useBookmarkContext } from "../ui/BookmarkProvider";
import type { BookmarkFolder, InlineEditingBookmark } from "./bookmark-model";

export function useFolderInlineEdit(folder: BookmarkFolder) {
  const { inlineEditor } = useBookmarkContext();
  const isEditing = isInlineEditingFolder(inlineEditor.inlineEditingBookmark, folder);

  const openFolderEditor = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      stopInteraction(event);
      inlineEditor.openInlineFolderEditor(folder);
    },
    [folder, inlineEditor],
  );

  async function handleFolderSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await inlineEditor.updateCurrentInlineEditor();
  }

  function handleFolderBlur(event: FocusEvent<HTMLFormElement>) {
    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }

    inlineEditor.cancelInlineEditor();
  }

  return {
    handleFolderBlur,
    handleFolderSubmit,
    inlineEditor,
    isEditing,
    openFolderEditor,
  };
}

function isInlineEditingFolder(inlineEditingBookmark: InlineEditingBookmark | null, folder: BookmarkFolder): boolean {
  return inlineEditingBookmark?.kind === "folder" && inlineEditingBookmark.id === folder.id;
}
