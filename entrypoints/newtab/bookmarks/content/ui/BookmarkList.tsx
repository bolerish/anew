import type { BookmarkIconDisplayMode } from "../../lib/model";
import { BookmarkProvider } from "../bookmark-provider";
import { BookmarkContent } from "./BookmarkContent";

type BookmarkListProps = {
  bookmarkIconMode: BookmarkIconDisplayMode;
  rootBookmarkId: string | null;
  rootBookmarkTitle: string | null;
  onBookmarksChange: () => Promise<void>;
};

export function BookmarkList({
  bookmarkIconMode,
  rootBookmarkId,
  rootBookmarkTitle,
  onBookmarksChange,
}: BookmarkListProps) {
  return (
    <div className="min-h-0 flex-1 overflow-hidden">
      <BookmarkProvider
        bookmarkIconMode={bookmarkIconMode}
        rootBookmarkId={rootBookmarkId}
        rootBookmarkTitle={rootBookmarkTitle}
        onBookmarksChange={onBookmarksChange}
      >
        <BookmarkContent />
      </BookmarkProvider>
    </div>
  );
}
