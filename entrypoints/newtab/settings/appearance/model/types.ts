import type { BookmarkIconDisplayMode } from "~shared/config/appearance";

export type { BookmarkIconDisplayMode };

export type AppearanceSettings = {
  bookmarkIconDisplayMode: BookmarkIconDisplayMode;
  cornerRadius: number;
  fontFamily: string;
  headingFontFamily: string;
  fontScale: number;
  headingScale: number;
};
