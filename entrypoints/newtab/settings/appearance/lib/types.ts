import type { BookmarkIconDisplayMode } from "~newtab/bookmarks/lib/model";

export type { BookmarkIconDisplayMode };

export type AppearanceSettings = {
  bookmarkIconDisplayMode: BookmarkIconDisplayMode;
  cornerRadius: number;
  fontFamily: string;
  fontSize: number | null;
};
