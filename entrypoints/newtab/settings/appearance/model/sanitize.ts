import { clamp } from "es-toolkit";
import { z } from "zod";

import { CORNER_RADIUS, DEFAULT_APPEARANCE_SETTINGS, TEXT_SCALE } from "./constants";
import type { AppearanceSettings } from "./types";

const LEGACY_FONT_SIZE = { min: 10, max: 16, base: 12.25 };

export const appearanceSchema = z.object({
  bookmarkIconDisplayMode: z
    .enum(["dash", "none", "original", "square"])
    .catch(DEFAULT_APPEARANCE_SETTINGS.bookmarkIconDisplayMode),
  cornerRadius: z
    .number()
    .transform((value) => clamp(value, CORNER_RADIUS.min, CORNER_RADIUS.max))
    .catch(DEFAULT_APPEARANCE_SETTINGS.cornerRadius),
  fontFamily: z.string().trim().catch(DEFAULT_APPEARANCE_SETTINGS.fontFamily),
  headingFontFamily: z.string().trim().catch(DEFAULT_APPEARANCE_SETTINGS.fontFamily),
  fontScale: z
    .number()
    .transform((value) => clamp(value, TEXT_SCALE.min, TEXT_SCALE.max))
    .catch(TEXT_SCALE.default),
  headingScale: z
    .number()
    .transform((value) => clamp(value, TEXT_SCALE.min, TEXT_SCALE.max))
    .catch(TEXT_SCALE.default),
});
const storedAppearanceSchema = z.record(z.string(), z.unknown()).catch({});
const legacyFontSizeSchema = z
  .number()
  .transform((value) => clamp(value, LEGACY_FONT_SIZE.min, LEGACY_FONT_SIZE.max) / LEGACY_FONT_SIZE.base);

export function sanitizeAppearanceSettings(value: unknown): AppearanceSettings {
  const settings = storedAppearanceSchema.parse(value);
  return appearanceSchema.parse({
    ...settings,
    headingFontFamily: settings.headingFontFamily ?? settings.fontFamily,
    fontScale: migrateTextScale(settings.fontScale, settings.fontSize),
    headingScale: migrateTextScale(
      settings.headingScale,
      settings.dateTimeFontSize === undefined ? settings.fontSize : settings.dateTimeFontSize,
    ),
  });
}

function migrateTextScale(value: unknown, legacySize: unknown): unknown {
  if (value !== undefined) return value;
  return legacyFontSizeSchema.safeParse(legacySize).data;
}
