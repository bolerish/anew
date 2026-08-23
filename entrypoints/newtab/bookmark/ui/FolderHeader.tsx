import { CheckIcon, TrashSimpleIcon } from "@phosphor-icons/react";
import { useEffect, useRef, type Ref } from "react";
import { stopInteraction } from "~shared/lib/event";
import { UI_LANGUAGE } from "~shared/lib/language";
import { cn } from "~shared/lib/utils";
import { AccordionTrigger } from "~shared/ui/accordion";
import { Button } from "~shared/ui/button";
import { Input } from "~shared/ui/input";

import { deleteFolder as deleteBookmarkFolder } from "../api/update";
import { isRootBookmarkFolder, type BookmarkFolder } from "../model/types";
import { useFolderEdit } from "../model/useFolderEdit";
import { DragHandle } from "./DragHandle";

type FolderHeaderProps = {
  folder: BookmarkFolder;
  handleRef: Ref<HTMLButtonElement>;
  isDragging: boolean;
  onMove: (direction: "down" | "up") => void;
};

export function FolderHeader({ folder, handleRef, isDragging, onMove }: FolderHeaderProps) {
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const canModify = !isRootBookmarkFolder(folder);
  const { editor, handleSubmit, isEditing, openEditor } = useFolderEdit(folder);
  const folderToggle = (
    <AccordionTrigger
      aria-label={`${folder.displayTitle} ${UI_LANGUAGE.bookmark.action.toggleFolder}`}
      className="size-6 flex-none shrink-0 items-center justify-center gap-0 p-0 hover:no-underline **:data-[slot=accordion-trigger-icon]:m-0 **:data-[slot=accordion-trigger-icon]:size-3"
      type="button"
    />
  );

  function deleteFolder() {
    void deleteBookmarkFolder(folder);
  }

  useEffect(() => {
    if (!isEditing) return;

    titleInputRef.current?.focus();
    titleInputRef.current?.select();
  }, [isEditing]);

  return (
    <header
      className={cn(
        "group/bookmark-folder-header hover:bg-accent grid-cols-mds-bookmark-folder relative mx-4 grid min-h-6 items-center gap-2 border-b border-transparent px-1 transition-colors",
        isEditing && "border-border",
      )}
    >
      {canModify ? (
        <DragHandle
          kind="folder"
          isDragging={isDragging}
          label={UI_LANGUAGE.bookmark.action.moveFolder}
          onMove={onMove}
          ref={handleRef}
        />
      ) : null}
      {isEditing && canModify ? (
        <form className="contents" data-inline-bookmark-editor="" onSubmit={handleSubmit}>
          <div className="flex min-w-0 items-center gap-1">
            {folderToggle}
            <Input
              aria-label={UI_LANGUAGE.bookmark.action.renameFolder}
              className="text-mds-bookmark-section md:text-mds-bookmark-section m-0 h-fit min-w-0 flex-1 border-0 bg-transparent p-0 tracking-wide focus-visible:ring-0"
              ref={titleInputRef}
              value={editor.inlineTitle}
              onChange={(event) => editor.setInlineTitle(event.target.value)}
            />
          </div>
          <div className="flex w-30 items-center justify-end gap-1">
            <Button
              aria-label={UI_LANGUAGE.bookmark.action.saveFolder}
              className="text-muted-foreground hover:text-muted-foreground hover:bg-transparent"
              size="icon-sm"
              title={UI_LANGUAGE.bookmark.action.saveFolder}
              type="button"
              variant="ghost"
              onMouseDown={stopInteraction}
              onClick={(event) => {
                stopInteraction(event);
                void editor.updateCurrentInlineEditor();
              }}
            >
              <CheckIcon className="h-4 w-4" />
            </Button>
            <Button
              aria-label={UI_LANGUAGE.bookmark.action.removeFolder}
              className="text-muted-foreground hover:text-muted-foreground hover:bg-transparent"
              size="icon-sm"
              title={UI_LANGUAGE.bookmark.action.removeFolder}
              type="button"
              variant="ghost"
              onMouseDown={stopInteraction}
              onClick={(event) => {
                stopInteraction(event);
                deleteFolder();
              }}
            >
              <TrashSimpleIcon className="h-4 w-4" />
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex min-w-0 items-center gap-1">
            {folderToggle}
            <div className="relative min-w-0 flex-1">
              <h2 className="text-mds-bookmark-section text-muted-foreground pointer-events-none truncate tracking-wide">
                {folder.displayTitle}
              </h2>
              {canModify ? (
                <button
                  aria-label={UI_LANGUAGE.bookmark.action.renameFolder}
                  className="focus-visible:ring-ring absolute inset-0 cursor-text rounded-sm outline-none focus-visible:ring-2"
                  type="button"
                  onClick={openEditor}
                />
              ) : null}
            </div>
          </div>
          <div className="flex w-30 items-center justify-end gap-1 opacity-0 transition-opacity group-hover/bookmark-folder-header:opacity-100 focus-within:opacity-100">
            {canModify ? (
              <Button
                aria-label={UI_LANGUAGE.bookmark.action.removeFolder}
                className="text-muted-foreground hover:text-muted-foreground hover:bg-transparent"
                size="icon-sm"
                title={UI_LANGUAGE.bookmark.action.removeFolder}
                type="button"
                variant="ghost"
                onMouseDown={stopInteraction}
                onClick={(event) => {
                  stopInteraction(event);
                  deleteFolder();
                }}
              >
                <TrashSimpleIcon className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </>
      )}
    </header>
  );
}
