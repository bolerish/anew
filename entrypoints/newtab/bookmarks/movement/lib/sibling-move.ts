type IndexedBookmark = {
  bookmarkIndex?: number;
};

export function resolvePreviousSibling<T>(siblings: T[], currentIndex: number): T | null {
  return currentIndex > 0 ? siblings[currentIndex - 1] : null;
}

export function resolveNextSibling<T>(siblings: T[], currentIndex: number): T | null {
  return currentIndex >= 0 && currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;
}

export function computePreviousInsertIndex(sibling: IndexedBookmark): number {
  return sibling.bookmarkIndex ?? 0;
}

export function computeNextInsertIndex(sibling: IndexedBookmark, fallbackIndex: number): number {
  return (sibling.bookmarkIndex ?? fallbackIndex) + 1;
}
