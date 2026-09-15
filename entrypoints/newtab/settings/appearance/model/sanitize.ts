import { clamp } from "es-toolkit";

import { CORNER_RADIUS, DEFAULT_APPEARANCE_SETTINGS, TEXT_SCALE } from "./constants";
import type { AppearanceSettings, BookmarkIconDisplayMode } from "./types";

const LEGACY_FONT_SIZE = { min: 10, max: 16, base: 12.25 };

export function sanitizeAppearanceSettings(value: unknown): AppearanceSettings {
  const settings = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const bookmarkIconDisplayMode = settings.bookmarkIconDisplayMode;

  return {
    bookmarkIconDisplayMode: isBookmarkIconMode(bookmarkIconDisplayMode)
      ? bookmarkIconDisplayMode
      : DEFAULT_APPEARANCE_SETTINGS.bookmarkIconDisplayMode,
    cornerRadius: sanitizeCornerRadius(settings.cornerRadius),
    fontFamily: sanitizeFontFamily(settings.fontFamily),
    headingFontFamily: sanitizeFontFamily(settings.headingFontFamily ?? settings.fontFamily),
    fontScale: sanitizeTextScale(settings.fontScale, settings.fontSize),
    headingScale: sanitizeTextScale(
      settings.headingScale,
      settings.dateTimeFontSize === undefined ? settings.fontSize : settings.dateTimeFontSize,
    ),
  };
}

function sanitizeCornerRadius(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return DEFAULT_APPEARANCE_SETTINGS.cornerRadius;
  return clamp(value, CORNER_RADIUS.min, CORNER_RADIUS.max);
}

function sanitizeFontFamily(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_APPEARANCE_SETTINGS.fontFamily;
  return value.trim();
}

function sanitizeTextScale(value: unknown, legacySize: unknown): number {
  // Legacy content used 0.875rem at 0.875 density (12.25px with a 16px root).
  if (value === undefined && typeof legacySize === "number" && Number.isFinite(legacySize)) {
    value = clamp(legacySize, LEGACY_FONT_SIZE.min, LEGACY_FONT_SIZE.max) / LEGACY_FONT_SIZE.base;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) return TEXT_SCALE.default;
  return clamp(value, TEXT_SCALE.min, TEXT_SCALE.max);
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
