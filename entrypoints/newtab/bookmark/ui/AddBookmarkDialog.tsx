import { PlusIcon } from "@phosphor-icons/react";
import { useEffect, useId, useState, type KeyboardEvent } from "react";
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

import type { BookmarkLocation } from "../model/bookmark-model";
import { useAddBookmarkForm } from "../model/useAddBookmarkForm";
import { LocationSelect } from "./LocationSelect";

type AddBookmarkDialogProps = {
  locations: BookmarkLocation[];
  onBookmarksChange: () => Promise<void>;
  selectedLocationId: string | null;
};

export function AddBookmarkDialog({ locations, onBookmarksChange, selectedLocationId }: AddBookmarkDialogProps) {
  const [targetId, setTargetId] = useState(selectedLocationId);
  const parentId = targetId && locations.some((location) => location.id === targetId) ? targetId : null;
  const addBookmark = useAddBookmarkForm({
    parentId,
    onCreated: onBookmarksChange,
  });
  const hasUrlError = addBookmark.url.trim().length > 0 && !addBookmark.isUrlValid;
  const urlErrorId = useId();

  useEffect(() => {
    if (targetId && locations.some((location) => location.id === targetId)) {
      return;
    }

    setTargetId(selectedLocationId ?? locations[0]?.id ?? null);
  }, [locations, selectedLocationId, targetId]);

  function handleOpenChange(open: boolean) {
    if (open) {
      addBookmark.resetForm();
      setTargetId(selectedLocationId);
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
          {locations.length > 1 ? (
            <label className="grid gap-1">
              <span className="text-muted-foreground text-mds-caption">{UI_LANGUAGE.bookmark.label.saveTo}</span>
              <LocationSelect
                ariaLabel={UI_LANGUAGE.bookmark.label.saveTo}
                locations={locations}
                selectedLocationId={parentId}
                triggerClassName="w-full"
                onLocationChange={setTargetId}
              />
            </label>
          ) : null}
          <DialogFooter showCloseButton={false}>
            <Button disabled={!addBookmark.canSave} type="submit" className="w-1/2 py-3">
              {UI_LANGUAGE.bookmark.action.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
