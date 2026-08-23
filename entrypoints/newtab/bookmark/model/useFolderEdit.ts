import type { SubmitEvent, MouseEvent } from "react";
import { stopInteraction } from "~shared/lib/event";

import { useBookmarkContext } from "./Provider";
import type { BookmarkFolder, InlineEditingBookmark } from "./types";

export function useFolderEdit(folder: BookmarkFolder) {
  const { editor } = useBookmarkContext();
  const isEditing = isInlineEditingFolder(editor.inlineEditingBookmark, folder);

  function openEditor(event: MouseEvent<HTMLButtonElement>) {
    stopInteraction(event);
    editor.openInlineFolderEditor(folder);
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    await editor.updateCurrentInlineEditor();
  }

  return {
    handleSubmit,
    editor,
    isEditing,
    openEditor,
  };
}

function isInlineEditingFolder(inlineEditingBookmark: InlineEditingBookmark | null, folder: BookmarkFolder): boolean {
  return inlineEditingBookmark?.kind === "folder" && inlineEditingBookmark.id === folder.id;
}
