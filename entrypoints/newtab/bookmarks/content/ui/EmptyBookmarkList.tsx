import { PlusIcon } from "@phosphor-icons/react";
import { UI_LANGUAGE } from "~newtab/shared/lib/language";
import { Button } from "~newtab/shared/ui/button";

import { useAddItemForm } from "../../add/hooks/useAddItemForm";
import { AddItemForm } from "../../add/ui/AddItemForm";
import { useBookmarkContext } from "../bookmark-provider";

export function EmptyBookmarkList() {
  const { onBookmarksChange, rootBookmarkId, rootBookmarkTitle } = useBookmarkContext();
  const addItem = useAddItemForm({
    parentId: rootBookmarkId,
    onCreated: onBookmarksChange,
  });

  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        <div className="group/bookmark-folder hover:bg-accent grid min-h-7 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 p-1 transition-colors">
          <h2 className="text-mds-bookmark-section text-muted-foreground truncate tracking-wide">
            {rootBookmarkTitle ?? UI_LANGUAGE.bookmarks.title.root}
          </h2>
          <Button
            aria-label={UI_LANGUAGE.bookmarks.action.add}
            size="icon-sm"
            title={UI_LANGUAGE.bookmarks.action.add}
            variant="secondary"
            onClick={addItem.toggleForm}
          >
            <PlusIcon className="size-4" />
          </Button>
        </div>
        <p className="text-muted-foreground text-mds-content p-1">{UI_LANGUAGE.bookmarks.message.noResults}</p>
        <AddItemForm addItem={addItem} onCancel={addItem.closeForm} />
      </div>
    </div>
  );
}
