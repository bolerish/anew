import { PlusIcon } from "@phosphor-icons/react";
import { useEffect, useId, useMemo, useState, type KeyboardEvent } from "react";
import { UI_LANGUAGE } from "~shared/lib/language";
import { Button } from "~shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~shared/ui/dialog";
import { Input } from "~shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~shared/ui/select";

import type { BookmarkFolder } from "../model/bookmark-model";
import { useAddBookmarkForm } from "../model/useAddBookmarkForm";

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
  const [targetId, setTargetId] = useState(targets[0]?.id ?? null);
  const parentId = targetId && targets.some((target) => target.id === targetId) ? targetId : null;
  const addBookmark = useAddBookmarkForm({
    parentId,
    onCreated: onBookmarksChange,
  });
  const hasUrlError = addBookmark.url.trim().length > 0 && !addBookmark.isUrlValid;
  const urlErrorId = useId();

  useEffect(() => {
    if (targetId && targets.some((target) => target.id === targetId)) {
      return;
    }

    setTargetId(targets[0]?.id ?? null);
  }, [targetId, targets]);

  function handleOpenChange(open: boolean) {
    if (open) {
      addBookmark.resetForm();
      return;
    }

    addBookmark.closeForm();
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Escape") {
      return;
    }

    event.preventDefault();
    addBookmark.closeForm();
  }

  return (
    <Dialog open={addBookmark.isAddingBookmark} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            aria-label={UI_LANGUAGE.bookmark.action.add}
            size="icon-sm"
            title={UI_LANGUAGE.bookmark.action.add}
            variant="outline"
            className="text-foreground/75 hover:text-foreground"
          />
        }
      >
        <PlusIcon className="size-4" />
      </DialogTrigger>
      <DialogContent className="rounded-mds gap-3 p-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{UI_LANGUAGE.bookmark.title.add}</DialogTitle>
          <DialogDescription>{UI_LANGUAGE.bookmark.description.saveTo}</DialogDescription>
        </DialogHeader>
        <form className="grid gap-3" onSubmit={addBookmark.handleSubmit}>
          <Input
            aria-label={UI_LANGUAGE.bookmark.label.title}
            className="h-8"
            placeholder={UI_LANGUAGE.bookmark.placeholder.title}
            value={addBookmark.title}
            onKeyDown={handleInputKeyDown}
            onChange={(event) => addBookmark.setTitle(event.target.value)}
          />
          <Input
            aria-label={UI_LANGUAGE.bookmark.label.url}
            aria-describedby={hasUrlError ? urlErrorId : undefined}
            aria-invalid={hasUrlError}
            className="h-8"
            placeholder={UI_LANGUAGE.bookmark.placeholder.url}
            title={hasUrlError ? UI_LANGUAGE.bookmark.error.invalidUrl : undefined}
            value={addBookmark.url}
            onKeyDown={handleInputKeyDown}
            onChange={(event) => addBookmark.setUrl(event.target.value)}
          />
          {hasUrlError ? (
            <p className="text-destructive text-mds-caption" id={urlErrorId} role="alert">
              {UI_LANGUAGE.bookmark.error.invalidUrl}
            </p>
          ) : null}
          {targets.length > 1 ? (
            <BookmarkSelect targets={targets} parentId={parentId} onTargetChange={setTargetId} />
          ) : null}
          <DialogFooter className="-mx-4 -mb-4" showCloseButton={false}>
            <Button disabled={!addBookmark.canSave} type="submit">
              {UI_LANGUAGE.bookmark.action.save}
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
          title: rootBookmarkTitle ?? UI_LANGUAGE.bookmark.title.root,
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
  return (
    <label className="grid gap-1">
      <span className="text-muted-foreground text-mds-caption">{UI_LANGUAGE.bookmark.label.saveTo}</span>
      <Select value={parentId ?? undefined} onValueChange={onTargetChange}>
        <SelectTrigger aria-label={UI_LANGUAGE.bookmark.label.saveTo} className="w-full" size="default">
          <SelectValue>{(value) => targets.find((target) => target.id === value)?.title ?? value}</SelectValue>
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
