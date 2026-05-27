import { useEffect, useState } from "react";
import { BookmarkList } from "~newtab/bookmarks/content/ui/BookmarkList";
import { SearchBar } from "~newtab/search/ui/SearchBar";

import type { RootLayoutContentProps } from "./layout";
import { appearanceStorage, initAppearanceSettings, type BookmarkIconDisplayMode } from "./settings/appearance";

export function App({ rootBookmarkId, rootBookmarkTitle, onBookmarksChange }: RootLayoutContentProps) {
  const [bookmarkIconMode, setBookmarkIconMode] = useState<BookmarkIconDisplayMode>(
    () => initAppearanceSettings().bookmarkIconDisplayMode,
  );

  useEffect(() => {
    return appearanceStorage.watch((settings) => setBookmarkIconMode(settings.bookmarkIconDisplayMode));
  }, []);

  return (
    <>
      <SearchBar />
      <BookmarkList
        bookmarkIconMode={bookmarkIconMode}
        rootBookmarkId={rootBookmarkId}
        rootBookmarkTitle={rootBookmarkTitle}
        onBookmarksChange={onBookmarksChange}
      />
    </>
  );
}
