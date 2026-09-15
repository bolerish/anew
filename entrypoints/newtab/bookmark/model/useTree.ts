import { useCallback, useEffect, useState } from "react";
import { browser } from "wxt/browser";

import { useEditSession } from "./edit-session";
import type { BookmarkTreeNode } from "./types";

let initialTree: BookmarkTreeNode[] | undefined;
export async function loadInitialBookmarkTree() {
  initialTree = await browser.bookmarks.getTree();
}
export function useTree() {
  const session = useEditSession();
  const [bookmarkTree, setBookmarkTree] = useState<BookmarkTreeNode[]>(() => initialTree ?? []);

  const loadBookmarks = useCallback(async () => {
    const bookmarkTree = await browser.bookmarks.getTree();
    setBookmarkTree(bookmarkTree);
  }, []);

  useEffect(() => {
    if (!initialTree) void loadBookmarks();

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
    bookmarkTree: session.draft?.tree ?? bookmarkTree,
    loadBookmarks,
  };
}
