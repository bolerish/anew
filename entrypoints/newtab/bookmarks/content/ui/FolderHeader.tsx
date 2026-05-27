import { PlusIcon } from "@phosphor-icons/react";
import type { FocusEvent, FormEvent, MouseEvent, Ref } from "react";
import { useCallback } from "react";
import { UI_LANGUAGE } from "~newtab/shared/lib/language";
import { cn } from "~newtab/shared/lib/utils";
import { Button } from "~newtab/shared/ui/button";
import { Input } from "~newtab/shared/ui/input";

import type { BookmarkFolder as BookmarkFolderValue } from "../../lib/model";
import { isRootBookmarkFolder } from "../../lib/model";
import { MoveButton, RemoveButton, SaveButton } from "../../ui/BookmarkActions";
import type { BookmarkContextValue } from "../bookmark-provider";
import { useFolderInlineEdit } from "../hooks/useFolderInlineEdit";
import { useFolderSiblingMove } from "../hooks/useFolderSiblingMove";
import { deleteBookmarkFolder } from "../lib/mutation";
import { DragHandle } from "./DragHandle";

type FolderHeaderProps = {
  dnd: {
    handleRef: Ref<HTMLButtonElement>;
    isDragSource: boolean;
  };
  folder: BookmarkFolderValue;
  onAddItem: () => void;
};

export function FolderHeader({ dnd, folder, onAddItem }: FolderHeaderProps) {
  const canModifyFolder = !isRootBookmarkFolder(folder);
  const { handleFolderBlur, handleFolderSubmit, inlineTitle, isEditing, openFolderEditor } =
    useFolderInlineEdit(folder);
  const { moveFolderDown, moveFolderUp, nextFolder, previousFolder } = useFolderSiblingMove(folder);
  const deleteFolder = useCallback(() => {
    void deleteBookmarkFolder(folder);
  }, [folder]);

  return (
    <header
      className={cn(
        "group/bookmark-folder hover:bg-accent grid-cols-mds-bookmark-folder relative grid min-h-7 items-center gap-2 border-b border-transparent p-1 transition-colors",
        isEditing && "border-border",
      )}
    >
      {canModifyFolder ? (
        <DragHandle isDragging={dnd.isDragSource} label={UI_LANGUAGE.bookmarks.action.moveFolder} ref={dnd.handleRef} />
      ) : null}
      <FolderHeaderContent
        canModifyFolder={canModifyFolder}
        edit={{
          inlineTitle,
          isEditing,
          onBlur: handleFolderBlur,
          onEditFolder: openFolderEditor,
          onSubmit: handleFolderSubmit,
        }}
        folder={folder}
        move={{
          nextFolder,
          previousFolder,
          onMoveFolderDown: moveFolderDown,
          onMoveFolderUp: moveFolderUp,
        }}
        onAddItem={onAddItem}
        onRemoveFolder={deleteFolder}
      />
    </header>
  );
}

type FolderHeaderContentProps = {
  canModifyFolder: boolean;
  edit: {
    inlineTitle: BookmarkContextValue["inlineTitle"];
    isEditing: boolean;
    onBlur: (event: FocusEvent<HTMLFormElement>) => void;
    onEditFolder: (event: MouseEvent<HTMLButtonElement>) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  };
  folder: BookmarkFolderValue;
  move: {
    nextFolder: BookmarkFolderValue | null;
    previousFolder: BookmarkFolderValue | null;
    onMoveFolderDown: () => void;
    onMoveFolderUp: () => void;
  };
  onAddItem: () => void;
  onRemoveFolder: () => void;
};

function FolderHeaderContent({
  canModifyFolder,
  edit,
  folder,
  move,
  onAddItem,
  onRemoveFolder,
}: FolderHeaderContentProps) {
  if (edit.isEditing && canModifyFolder) {
    return (
      <TitleForm
        inlineTitle={edit.inlineTitle}
        onBlur={edit.onBlur}
        onRemoveFolder={onRemoveFolder}
        onSubmit={edit.onSubmit}
      />
    );
  }

  return (
    <TitleRow
      canModifyFolder={canModifyFolder}
      folder={folder}
      nextFolder={move.nextFolder}
      previousFolder={move.previousFolder}
      onAddItem={onAddItem}
      onEditFolder={edit.onEditFolder}
      onMoveFolderDown={move.onMoveFolderDown}
      onMoveFolderUp={move.onMoveFolderUp}
      onRemoveFolder={onRemoveFolder}
    />
  );
}

type TitleFormProps = {
  inlineTitle: BookmarkContextValue["inlineTitle"];
  onBlur: (event: FocusEvent<HTMLFormElement>) => void;
  onRemoveFolder: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function TitleForm({ inlineTitle, onBlur, onRemoveFolder, onSubmit }: TitleFormProps) {
  return (
    <form className="contents" data-inline-bookmark-editor="" onBlur={onBlur} onSubmit={onSubmit}>
      <Input
        aria-label={UI_LANGUAGE.bookmarks.action.renameFolder}
        className="text-mds-bookmark-section h-7 min-w-0 rounded-none border-0 bg-transparent px-0 focus-visible:ring-0"
        value={inlineTitle.inlineTitle}
        onChange={(event) => inlineTitle.setInlineTitle(event.target.value)}
      />
      <div className="flex w-30 items-center justify-end gap-1">
        <SaveButton
          label={UI_LANGUAGE.bookmarks.action.saveFolder}
          onSave={() => {
            void inlineTitle.updateCurrentInlineEditor();
          }}
        />
        <RemoveButton label={UI_LANGUAGE.bookmarks.action.removeFolder} onRemove={onRemoveFolder} />
      </div>
    </form>
  );
}

type TitleRowProps = {
  canModifyFolder: boolean;
  folder: BookmarkFolderValue;
  nextFolder: BookmarkFolderValue | null;
  previousFolder: BookmarkFolderValue | null;
  onAddItem: () => void;
  onEditFolder: (event: MouseEvent<HTMLButtonElement>) => void;
  onMoveFolderDown: () => void;
  onMoveFolderUp: () => void;
  onRemoveFolder: () => void;
};

function TitleRow({
  canModifyFolder,
  folder,
  nextFolder,
  previousFolder,
  onAddItem,
  onEditFolder,
  onMoveFolderDown,
  onMoveFolderUp,
  onRemoveFolder,
}: TitleRowProps) {
  return (
    <>
      <div className="min-w-0">
        <div className="grid min-w-0 grid-cols-[max-content_1fr] items-center">
          <h2 className="text-mds-bookmark-section text-muted-foreground truncate tracking-wide">
            {folder.displayTitle}
          </h2>
          {canModifyFolder ? (
            <button
              aria-label={UI_LANGUAGE.bookmarks.action.renameFolder}
              className="focus-visible:ring-ring h-full min-h-7 rounded-sm outline-none focus-visible:ring-2"
              type="button"
              onClick={onEditFolder}
            />
          ) : null}
        </div>
      </div>
      <div className="flex w-30 items-center justify-end gap-1 opacity-0 transition-opacity group-hover/bookmark-folder:opacity-100 focus-within:opacity-100">
        {canModifyFolder ? (
          <>
            <MoveButton
              disabled={!previousFolder}
              direction="up"
              label={UI_LANGUAGE.bookmarks.action.moveFolderUp}
              onMove={onMoveFolderUp}
            />
            <MoveButton
              disabled={!nextFolder}
              direction="down"
              label={UI_LANGUAGE.bookmarks.action.moveFolderDown}
              onMove={onMoveFolderDown}
            />
          </>
        ) : null}
        <Button
          aria-label={UI_LANGUAGE.bookmarks.action.add}
          size="icon-sm"
          title={UI_LANGUAGE.bookmarks.action.add}
          variant="secondary"
          onClick={onAddItem}
        >
          <PlusIcon className="size-4" />
        </Button>
        {canModifyFolder ? (
          <RemoveButton label={UI_LANGUAGE.bookmarks.action.removeFolder} onRemove={onRemoveFolder} />
        ) : null}
      </div>
    </>
  );
}
