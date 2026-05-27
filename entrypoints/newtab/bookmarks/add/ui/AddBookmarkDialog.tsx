import { PlusIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { UI_LANGUAGE } from "~newtab/shared/lib/language";
import { Button } from "~newtab/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~newtab/shared/ui/dialog";
import { Input } from "~newtab/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~newtab/shared/ui/select";

import type { BookmarkFolder } from "../../lib/model";
import { useAddItemForm } from "../hooks/useAddItemForm";

type AddBookmarkDialogProps = {
  folders: BookmarkFolder[];
  rootBookmarkId: string | null;
  rootBookmarkTitle: string | null;
  onBookmarksChange: () => Promise<void>;
};

type BookmarkTarget = {
  id: string;
  title: string;
};

export function AddBookmarkDialog({
  folders,
  rootBookmarkId,
  rootBookmarkTitle,
  onBookmarksChange,
}: AddBookmarkDialogProps) {
  const targets = useMemo(
    () => deriveBookmarkTargets({ folders, rootBookmarkId, rootBookmarkTitle }),
    [folders, rootBookmarkId, rootBookmarkTitle],
  );
  const targetIds = useMemo(() => new Set(targets.map((target) => target.id)), [targets]);
  const [targetId, setTargetId] = useState(targets[0]?.id ?? null);
  const parentId = targetId && targetIds.has(targetId) ? targetId : null;
  const addItem = useAddItemForm({
    parentId,
    onCreated: onBookmarksChange,
  });
  const urlHasError = addItem.url.trim().length > 0 && !addItem.urlIsValid;

  useEffect(() => {
    if (targetId && targetIds.has(targetId)) {
      return;
    }

    setTargetId(targets[0]?.id ?? null);
  }, [targetId, targetIds, targets]);

  function handleOpenChange(open: boolean) {
    if (open) {
      addItem.resetForm();
      return;
    }

    addItem.closeForm();
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Escape") {
      return;
    }

    event.preventDefault();
    addItem.closeForm();
  }

  return (
    <Dialog open={addItem.isAddingItem} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            aria-label={UI_LANGUAGE.bookmarks.action.add}
            size="icon-sm"
            title={UI_LANGUAGE.bookmarks.action.add}
            variant="outline"
            className="text-foreground/75 hover:text-foreground"
          />
        }
      >
        <PlusIcon className="size-4" />
      </DialogTrigger>
      <DialogContent className="rounded-mds gap-3 p-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{UI_LANGUAGE.bookmarks.title.add}</DialogTitle>
          <DialogDescription>{UI_LANGUAGE.bookmarks.description.saveTo}</DialogDescription>
        </DialogHeader>
        <form className="grid gap-3" onSubmit={addItem.handleSubmit}>
          <Input
            aria-label={UI_LANGUAGE.bookmarks.label.title}
            className="h-8"
            placeholder={UI_LANGUAGE.bookmarks.placeholder.title}
            value={addItem.title}
            onKeyDown={handleInputKeyDown}
            onChange={(event) => addItem.setTitle(event.target.value)}
          />
          <Input
            aria-label={UI_LANGUAGE.bookmarks.label.url}
            aria-invalid={urlHasError}
            className="h-8"
            placeholder={UI_LANGUAGE.bookmarks.placeholder.url}
            title={urlHasError ? UI_LANGUAGE.bookmarks.error.invalidUrl : undefined}
            value={addItem.url}
            onKeyDown={handleInputKeyDown}
            onChange={(event) => addItem.setUrl(event.target.value)}
          />
          {targets.length > 1 ? (
            <BookmarkSelect targets={targets} parentId={parentId} onTargetChange={setTargetId} />
          ) : null}
          <DialogFooter className="-mx-4 -mb-4" showCloseButton={false}>
            <Button disabled={!addItem.canSave} type="submit">
              {UI_LANGUAGE.bookmarks.action.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function deriveBookmarkTargets({
  folders,
  rootBookmarkId,
  rootBookmarkTitle,
}: Pick<AddBookmarkDialogProps, "folders" | "rootBookmarkId" | "rootBookmarkTitle">): BookmarkTarget[] {
  const rootTarget = rootBookmarkId
    ? [
        {
          id: rootBookmarkId,
          title: rootBookmarkTitle ?? UI_LANGUAGE.bookmarks.title.root,
        },
      ]
    : [];
  const folderTargets = folders
    .filter((folder) => folder.id !== rootBookmarkId)
    .map((folder) => ({
      id: folder.id,
      title: folder.displayTitle,
    }));

  return [...rootTarget, ...folderTargets];
}

type BookmarkSelectProps = {
  targets: BookmarkTarget[];
  parentId: string | null;
  onTargetChange: (targetId: string) => void;
};

function BookmarkSelect({ targets, parentId, onTargetChange }: BookmarkSelectProps) {
  const targetLabels = useMemo(() => new Map(targets.map((target) => [target.id, target.title])), [targets]);

  return (
    <label className="grid gap-1">
      <span className="text-muted-foreground text-mds-caption">{UI_LANGUAGE.bookmarks.label.saveTo}</span>
      <Select value={parentId ?? undefined} onValueChange={onTargetChange}>
        <SelectTrigger aria-label={UI_LANGUAGE.bookmarks.label.saveTo} className="w-full" size="default">
          <SelectValue>{(value) => targetLabels.get(value) ?? value}</SelectValue>
        </SelectTrigger>
        <SelectContent className="font-mono" position="popper">
          {targets.map((target) => (
            <SelectItem key={target.id} value={target.id}>
              {target.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
