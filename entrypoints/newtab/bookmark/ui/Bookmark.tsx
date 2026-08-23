import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { PlusIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import { UI_LANGUAGE } from "~shared/lib/language";
import { Button } from "~shared/ui/button";

import { BookmarkProvider, useBookmarkContext } from "../model/Provider";
import type { BookmarkFolder, BookmarkIconDisplayMode } from "../model/types";
import { useAddForm } from "../model/useAddForm";
import { useDndMove } from "../model/useDndMove";
import { useKeyboardNavigation } from "../model/useKeyboardNavigation";
import { AddForm } from "./AddForm";
import { Folder } from "./Folder";

type BookmarkProps = {
  bookmarkIconMode: BookmarkIconDisplayMode;
  folders: BookmarkFolder[];
  isSearchActive: boolean;
  onBookmarksChange: () => Promise<void>;
  rootId: string | null;
  rootTitle: string | null;
  visibleFolders: BookmarkFolder[];
};

export function Bookmark({
  bookmarkIconMode,
  folders,
  isSearchActive,
  onBookmarksChange,
  rootId,
  rootTitle,
  visibleFolders,
}: BookmarkProps) {
  return (
    <div className="min-h-0 flex-1 overflow-hidden">
      <BookmarkProvider
        bookmarkIconMode={bookmarkIconMode}
        folders={folders}
        isSearchActive={isSearchActive}
        onBookmarksChange={onBookmarksChange}
        visibleFolders={visibleFolders}
      >
        <Content rootId={rootId} rootTitle={rootTitle} />
      </BookmarkProvider>
    </div>
  );
}

type ContentProps = Pick<BookmarkProps, "rootId" | "rootTitle">;

function Content({ rootId, rootTitle }: ContentProps) {
  const { activeBookmark, editor, folders, isSearchActive, onBookmarksChange, setActiveBookmark, visibleFolders } =
    useBookmarkContext();
  const dnd = useDndMove({ folders, isSearchActive, onBookmarksChange });

  useEffect(() => {
    return monitorForElements({ onDrop: dnd.handleDrop });
  }, [dnd.handleDrop]);

  useKeyboardNavigation({ activeBookmark, editor, setActiveBookmark, visibleFolders });

  return (
    <div className="over grid h-full scrollbar-thin content-start gap-2 overflow-x-hidden overflow-y-auto pt-5 pb-9">
      {visibleFolders.length > 0 ? (
        visibleFolders.map((folder) => <Folder folder={folder} key={folder.id} />)
      ) : (
        <EmptyState rootId={rootId} rootTitle={rootTitle} />
      )}
    </div>
  );
}

type EmptyStateProps = Pick<BookmarkProps, "rootId" | "rootTitle">;

function EmptyState({ rootId, rootTitle }: EmptyStateProps) {
  const { onBookmarksChange } = useBookmarkContext();
  const form = useAddForm({ parentId: rootId, onCreated: onBookmarksChange });

  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        <div className="group/bookmark-folder hover:bg-accent grid min-h-7 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 p-1 transition-colors">
          <h2 className="text-mds-bookmark-section text-muted-foreground truncate tracking-wide">
            {rootTitle ?? UI_LANGUAGE.bookmark.title.root}
          </h2>
          <Button
            aria-label={UI_LANGUAGE.bookmark.action.add}
            size="icon-sm"
            title={UI_LANGUAGE.bookmark.action.add}
            variant="secondary"
            onClick={form.toggleForm}
          >
            <PlusIcon className="size-4" />
          </Button>
        </div>
        <p className="text-muted-foreground text-mds-content p-1">{UI_LANGUAGE.bookmark.message.noResults}</p>
        <AddForm form={form} onCancel={form.closeForm} />
      </div>
    </div>
  );
}
