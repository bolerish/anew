import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect } from "react";
import { UI_LANGUAGE } from "~shared/lib/language";

import { BookmarkProvider, useBookmarkContext } from "../model/Provider";
import type { BookmarkFolder, BookmarkIconDisplayMode } from "../model/types";
import { useDndMove } from "../model/useDndMove";
import { useKeyboardNavigation } from "../model/useKeyboardNavigation";
import { AddFolder } from "./AddFolder";
import { Folder } from "./Folder";

type BookmarkProps = {
  bookmarkIconMode: BookmarkIconDisplayMode;
  folders: BookmarkFolder[];
  isSearchActive: boolean;
  onBookmarksChange: () => Promise<void>;
  rootTitle: string | null;
  selectedLocationId: string | null;
  visibleFolders: BookmarkFolder[];
};

export function Bookmark({
  bookmarkIconMode,
  folders,
  isSearchActive,
  onBookmarksChange,
  rootTitle,
  selectedLocationId,
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
        <Content rootTitle={rootTitle} selectedLocationId={selectedLocationId} />
      </BookmarkProvider>
    </div>
  );
}

type ContentProps = Pick<BookmarkProps, "rootTitle" | "selectedLocationId">;

function Content({ rootTitle, selectedLocationId }: ContentProps) {
  const { activeBookmark, editor, folders, isSearchActive, onBookmarksChange, setActiveBookmark, visibleFolders } =
    useBookmarkContext();
  const dnd = useDndMove({ folders, isSearchActive, onBookmarksChange });

  useEffect(() => {
    return monitorForElements({ onDrop: dnd.handleDrop });
  }, [dnd.handleDrop]);

  useKeyboardNavigation({ activeBookmark, editor, setActiveBookmark, visibleFolders });

  return (
    <div className="grid h-full scrollbar-thin content-start overflow-x-hidden overflow-y-auto pt-5 pb-9">
      {selectedLocationId
        ? visibleFolders.map((folder) => <Folder folder={folder} key={folder.id} parentId={selectedLocationId} />)
        : null}

      {visibleFolders.length === 0 && isSearchActive && (
        <p className="text-muted-foreground text-mds-bookmark-section px-7 py-3">
          {UI_LANGUAGE.bookmark.message.noResults}
        </p>
      )}

      {visibleFolders.length === 0 && !isSearchActive && selectedLocationId ? (
        <RootFolder parentId={selectedLocationId} title={rootTitle} />
      ) : null}
    </div>
  );
}

type RootFolderProps = {
  parentId: string;
  title: string | null;
};

function RootFolder({ parentId, title }: RootFolderProps) {
  return (
    <section className="mx-4 grid">
      <header className="border-border grid min-h-6 items-center border-b p-1">
        <h2 className="text-mds-bookmark-section text-muted-foreground truncate tracking-wide">
          {title ?? UI_LANGUAGE.bookmark.title.root}
        </h2>
      </header>
      <AddFolder alwaysVisible parentId={parentId} />
    </section>
  );
}
