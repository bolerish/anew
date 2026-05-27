import { browser } from "wxt/browser";
import type { BookmarkFolder } from "~newtab/bookmarks/lib/model";

import { resolveMatchingBookmark } from "./filter";

type ExecuteSearchQueryInput = {
  folders: BookmarkFolder[];
  query: string;
};

export async function executeSearchQuery({ folders, query }: ExecuteSearchQueryInput): Promise<void> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return;
  }

  if (isLikelyUrl(normalizedQuery)) {
    window.location.href = normalizeNavigationUrl(normalizedQuery);
    return;
  }

  const matchedBookmark = resolveMatchingBookmark(folders, normalizedQuery);

  if (matchedBookmark) {
    window.location.href = matchedBookmark.url;
    return;
  }

  await browser.search.query({
    disposition: "CURRENT_TAB",
    text: normalizedQuery,
  });
}

function isLikelyUrl(query: string): boolean {
  if (/^https?:\/\//i.test(query)) {
    return true;
  }

  if (query.includes(" ") || query.includes("\n")) {
    return false;
  }

  return /^[a-z0-9-]+(\.[a-z0-9-]+)+(?::\d+)?(\/.*)?$/i.test(query);
}

function normalizeNavigationUrl(rawUrl: string): string {
  const withProtocol = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;

  return new URL(withProtocol).toString();
}
