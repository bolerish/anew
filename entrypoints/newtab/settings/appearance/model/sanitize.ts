import { CORNER_RADIUS, DEFAULT_APPEARANCE_SETTINGS, FONT_SIZE } from "./constants";
import type { AppearanceSettings, BookmarkIconDisplayMode } from "./types";

export function sanitizeAppearanceSettings(settings: Partial<AppearanceSettings>): AppearanceSettings {
  const bookmarkIconDisplayMode = settings.bookmarkIconDisplayMode;

  return {
    bookmarkIconDisplayMode: isBookmarkIconMode(bookmarkIconDisplayMode)
      ? bookmarkIconDisplayMode
      : DEFAULT_APPEARANCE_SETTINGS.bookmarkIconDisplayMode,
    cornerRadius: sanitizeCornerRadius(settings.cornerRadius),
    fontFamily: sanitizeFontFamily(settings.fontFamily),
    fontSize: sanitizeFontSize(settings.fontSize),
  };
}

function sanitizeCornerRadius(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return DEFAULT_APPEARANCE_SETTINGS.cornerRadius;
  return Math.min(CORNER_RADIUS.max, Math.max(CORNER_RADIUS.min, value));
}

function sanitizeFontFamily(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_APPEARANCE_SETTINGS.fontFamily;
  return value.trim();
}

function sanitizeFontSize(value: unknown): number | null {
  if (value === null || value === undefined) return DEFAULT_APPEARANCE_SETTINGS.fontSize;
  if (typeof value !== "number" || !Number.isFinite(value)) return DEFAULT_APPEARANCE_SETTINGS.fontSize;
  return Math.min(FONT_SIZE.max, Math.max(FONT_SIZE.min, value));
}

const BOOKMARK_ICON_MODES = [
  "dash",
  "none",
  "original",
  "square",
] as const satisfies readonly BookmarkIconDisplayMode[];

function isBookmarkIconMode(value: unknown): value is BookmarkIconDisplayMode {
  return typeof value === "string" && (BOOKMARK_ICON_MODES as readonly string[]).includes(value);
}
