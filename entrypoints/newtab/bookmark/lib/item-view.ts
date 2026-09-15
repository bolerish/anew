import { browser } from "wxt/browser";

import type { BookmarkIconDisplayMode, BookmarkItem } from "../model/types";

export type BookmarkIconMarker = "dash" | "dot";

export type BookmarkItemEntry = {
  item: BookmarkItem;
  itemIndex: number;
};

export type BookmarkItemView = {
  icon: string | undefined;
  iconMarker: BookmarkIconMarker | undefined;
  item: BookmarkItem;
  showBookmarkIcon: boolean;
};

/** Grid view is available only for original site icons. */
export function resolveBookmarkView(icon: BookmarkIconDisplayMode, view: "list" | "icons"): "list" | "icons" {
  return icon === "original" ? view : "list";
}

export function deriveItemLabel(item: BookmarkItem): string {
  return item.title || item.url;
}

export function deriveBookmarkItemView(
  item: BookmarkItem,
  bookmarkIconMode: BookmarkIconDisplayMode,
): BookmarkItemView {
  return {
    icon: resolvePageIconUrl(item.url),
    iconMarker: resolveIconMarker(bookmarkIconMode),
    item,
    showBookmarkIcon: bookmarkIconMode !== "none",
  };
}

function resolveIconMarker(bookmarkIconMode: BookmarkIconDisplayMode): BookmarkIconMarker | undefined {
  if (bookmarkIconMode === "dash" || bookmarkIconMode === "dot") {
    return bookmarkIconMode;
  }

  return undefined;
}

const BOOKMARK_ICON_SIZE = 64;
export function resolvePageIconUrl(pageUrl: string): string {
  return browser.runtime.getURL(`/_favicon/?pageUrl=${encodeURIComponent(pageUrl)}&size=${BOOKMARK_ICON_SIZE}`);
}
