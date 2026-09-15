import type { BookmarkFolder } from "~/entrypoints/newtab/bookmark";

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

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase();
}
