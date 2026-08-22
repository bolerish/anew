import { useCallback, useEffect, useState } from "react";
import { browser } from "wxt/browser";

import type { BookmarkTreeNode } from "./bookmark-model";

export function useBookmarkTree() {
  const [bookmarkTree, setBookmarkTree] = useState<BookmarkTreeNode[]>([]);

  const loadBookmarks = useCallback(async () => {
    const bookmarkTree = await browser.bookmarks.getTree();
    setBookmarkTree(bookmarkTree);
  }, []);

  useEffect(() => {
    void loadBookmarks();

    const handleBookmarksChanged = () => {
      void loadBookmarks();
    };

    browser.bookmarks.onCreated.addListener(handleBookmarksChanged);
    browser.bookmarks.onRemoved.addListener(handleBookmarksChanged);
    browser.bookmarks.onChanged.addListener(handleBookmarksChanged);
    browser.bookmarks.onMoved.addListener(handleBookmarksChanged);
    browser.bookmarks.onChildrenReordered.addListener(handleBookmarksChanged);

    return () => {
      browser.bookmarks.onCreated.removeListener(handleBookmarksChanged);
      browser.bookmarks.onRemoved.removeListener(handleBookmarksChanged);
      browser.bookmarks.onChanged.removeListener(handleBookmarksChanged);
      browser.bookmarks.onMoved.removeListener(handleBookmarksChanged);
      browser.bookmarks.onChildrenReordered.removeListener(handleBookmarksChanged);
    };
  }, [loadBookmarks]);

  return {
    bookmarkTree,
    loadBookmarks,
  };
}
