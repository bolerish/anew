import { PlusIcon } from "@phosphor-icons/react";
import { UI_LANGUAGE } from "~shared/lib/language";
import { Button } from "~shared/ui/button";

import { useAddBookmarkForm } from "../model/useAddBookmarkForm";
import { AddBookmarkForm } from "./AddBookmarkForm";
import { useBookmarkContext } from "./BookmarkProvider";

export function EmptyBookmarkList() {
  const { onBookmarksChange, rootBookmarkId, rootBookmarkTitle } = useBookmarkContext();
  const addBookmark = useAddBookmarkForm({
    parentId: rootBookmarkId,
    onCreated: onBookmarksChange,
  });

  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        <div className="group/bookmark-folder hover:bg-accent grid min-h-7 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 p-1 transition-colors">
          <h2 className="text-mds-bookmark-section text-muted-foreground truncate tracking-wide">
            {rootBookmarkTitle ?? UI_LANGUAGE.bookmark.title.root}
          </h2>
          <Button
            aria-label={UI_LANGUAGE.bookmark.action.add}
            size="icon-sm"
            title={UI_LANGUAGE.bookmark.action.add}
            variant="secondary"
            onClick={addBookmark.toggleForm}
          >
            <PlusIcon className="size-4" />
          </Button>
        </div>
        <p className="text-muted-foreground text-mds-content p-1">{UI_LANGUAGE.bookmark.message.noResults}</p>
        <AddBookmarkForm addBookmark={addBookmark} onCancel={addBookmark.closeForm} />
      </div>
    </div>
  );
}
