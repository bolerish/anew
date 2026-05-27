import { CORNER_RADIUS, DEFAULT_APPEARANCE_SETTINGS, FONT_SIZE } from "./constants";
import { isSystemFontFamily } from "./font";
import type { AppearanceSettings, BookmarkIconDisplayMode } from "./types";
import { clamp } from "./utils";

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
  return clamp(value, CORNER_RADIUS.min, CORNER_RADIUS.max);
}

function sanitizeFontFamily(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_APPEARANCE_SETTINGS.fontFamily;
  const trimmed = value.trim();
  return isSystemFontFamily(trimmed) ? DEFAULT_APPEARANCE_SETTINGS.fontFamily : trimmed;
}

function sanitizeFontSize(value: unknown): number | null {
  if (value === null || value === undefined) return DEFAULT_APPEARANCE_SETTINGS.fontSize;
  if (typeof value !== "number" || !Number.isFinite(value)) return DEFAULT_APPEARANCE_SETTINGS.fontSize;
  return clamp(value, FONT_SIZE.min, FONT_SIZE.max);
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
