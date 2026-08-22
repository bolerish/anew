import type { BookmarkFolder, BookmarkItem } from "~/entrypoints/newtab/bookmark";

export function deriveVisibleBookmarkFolders(
  folders: readonly BookmarkFolder[],
  searchQuery: string,
): BookmarkFolder[] {
  const normalizedQuery = normalizeSearchText(searchQuery);

  if (!normalizedQuery) {
    return [...folders];
  }

  return folders
    .map((folder) => ({
      ...folder,
      items: folder.items.filter(
        (item) =>
          normalizeSearchText(item.title).includes(normalizedQuery) ||
          normalizeSearchText(item.url).includes(normalizedQuery),
      ),
    }))
    .filter((folder) => folder.items.length > 0);
}

export function resolveMatchingBookmark(folders: readonly BookmarkFolder[], query: string): BookmarkItem | null {
  const normalizedQuery = normalizeSearchText(query);
  const visibleItems = deriveVisibleBookmarkFolders(folders, query).flatMap((folder) => folder.items);

  return (
    visibleItems.find((item) => normalizeSearchText(item.title) === normalizedQuery) ??
    visibleItems.find((item) => normalizeSearchText(item.url) === normalizedQuery) ??
    (visibleItems.length === 1 ? visibleItems[0] : null)
  );
}

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase();
}
