import { useCallback, type FocusEvent, type FormEvent, type MouseEvent } from "react";
import { stopInteraction } from "~shared/lib/event";

import { useBookmarkContext } from "./Provider";
import type { BookmarkFolder, InlineEditingBookmark } from "./types";

export function useFolderEdit(folder: BookmarkFolder) {
  const { editor } = useBookmarkContext();
  const isEditing = isInlineEditingFolder(editor.inlineEditingBookmark, folder);

  const openEditor = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      stopInteraction(event);
      editor.openInlineFolderEditor(folder);
    },
    [editor, folder],
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

  return {
    handleBlur,
    handleSubmit,
    editor,
    isEditing,
    openEditor,
  };
}

function isInlineEditingFolder(inlineEditingBookmark: InlineEditingBookmark | null, folder: BookmarkFolder): boolean {
  return inlineEditingBookmark?.kind === "folder" && inlineEditingBookmark.id === folder.id;
}
