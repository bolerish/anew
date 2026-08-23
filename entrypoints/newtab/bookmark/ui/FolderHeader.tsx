import { CaretDownIcon, CaretUpIcon, CheckIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useRef, type Ref } from "react";
import { stopInteraction } from "~shared/lib/event";
import { UI_LANGUAGE } from "~shared/lib/language";
import { cn } from "~shared/lib/utils";
import { Button } from "~shared/ui/button";
import { Input } from "~shared/ui/input";

import { deleteFolder as deleteBookmarkFolder } from "../api/update";
import { isRootBookmarkFolder, type BookmarkFolder } from "../model/types";
import { useFolderEdit } from "../model/useFolderEdit";
import { useFolderMove } from "../model/useFolderMove";
import { DragHandle } from "./DragHandle";

type FolderHeaderProps = {
  folder: BookmarkFolder;
  handleRef: Ref<HTMLButtonElement>;
  isDragging: boolean;
  onAddItem: () => void;
};

export function FolderHeader({ folder, handleRef, isDragging, onAddItem }: FolderHeaderProps) {
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const canModify = !isRootBookmarkFolder(folder);
  const { editor, handleBlur, handleSubmit, isEditing, openEditor } = useFolderEdit(folder);
  const { moveFolderDown, moveFolderUp, nextFolder, previousFolder } = useFolderMove(folder);

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
        "group/bookmark-folder hover:bg-accent grid-cols-mds-bookmark-folder relative mx-4 grid min-h-7 items-center gap-2 border-b border-transparent p-1 transition-colors",
        isEditing && "border-border",
      )}
    >
      {canModify ? (
        <DragHandle isDragging={isDragging} label={UI_LANGUAGE.bookmark.action.moveFolder} ref={handleRef} />
      ) : null}
      {isEditing && canModify ? (
        <form className="contents" data-inline-bookmark-editor="" onBlur={handleBlur} onSubmit={handleSubmit}>
          <Input
            aria-label={UI_LANGUAGE.bookmark.action.renameFolder}
            className="text-mds-bookmark-section md:text-mds-bookmark-section h-7 min-w-0 rounded-none border-0 bg-transparent px-0 focus-visible:ring-0"
            ref={titleInputRef}
            value={editor.inlineTitle}
            onChange={(event) => editor.setInlineTitle(event.target.value)}
          />
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
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className="min-w-0">
            <div className="grid min-w-0 grid-cols-[max-content_1fr] items-center">
              <h2 className="text-mds-bookmark-section text-muted-foreground truncate tracking-wide">
                {folder.displayTitle}
              </h2>
              {canModify ? (
                <button
                  aria-label={UI_LANGUAGE.bookmark.action.renameFolder}
                  className="focus-visible:ring-ring h-full min-h-7 cursor-text rounded-sm outline-none focus-visible:ring-2"
                  type="button"
                  onClick={openEditor}
                />
              ) : null}
            </div>
          </div>
          <div className="flex w-30 items-center justify-end gap-1 opacity-0 transition-opacity group-hover/bookmark-folder:opacity-100 focus-within:opacity-100">
            {canModify ? (
              <>
                <Button
                  aria-label={UI_LANGUAGE.bookmark.action.moveFolderUp}
                  className="text-muted-foreground hover:text-muted-foreground hover:bg-transparent disabled:border-transparent disabled:bg-transparent disabled:text-transparent"
                  disabled={!previousFolder}
                  size="icon-sm"
                  title={UI_LANGUAGE.bookmark.action.moveFolderUp}
                  type="button"
                  variant="ghost"
                  onMouseDown={stopInteraction}
                  onClick={(event) => {
                    stopInteraction(event);
                    moveFolderUp();
                  }}
                >
                  <CaretUpIcon className="h-4 w-4" />
                </Button>
                <Button
                  aria-label={UI_LANGUAGE.bookmark.action.moveFolderDown}
                  className="text-muted-foreground hover:text-muted-foreground hover:bg-transparent disabled:border-transparent disabled:bg-transparent disabled:text-transparent"
                  disabled={!nextFolder}
                  size="icon-sm"
                  title={UI_LANGUAGE.bookmark.action.moveFolderDown}
                  type="button"
                  variant="ghost"
                  onMouseDown={stopInteraction}
                  onClick={(event) => {
                    stopInteraction(event);
                    moveFolderDown();
                  }}
                >
                  <CaretDownIcon className="h-4 w-4" />
                </Button>
              </>
            ) : null}
            <Button
              aria-label={UI_LANGUAGE.bookmark.action.add}
              size="icon-sm"
              title={UI_LANGUAGE.bookmark.action.add}
              type="button"
              variant="secondary"
              onClick={onAddItem}
            >
              <PlusIcon className="size-4" />
            </Button>
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
                <XIcon className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </>
      )}
    </header>
  );
}
