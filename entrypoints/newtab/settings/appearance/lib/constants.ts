import { type AppearanceSettings } from "./types";

export const CORNER_RADIUS = { default: 0, min: 0, max: 12 } as const;
export const FONT_SIZE = { default: null, min: 10, max: 16, preview: 14, step: 1 } as const;

export const DEFAULT_APPEARANCE_SETTINGS = {
  bookmarkIconDisplayMode: "original",
  cornerRadius: CORNER_RADIUS.default,
  fontFamily: "",
  fontSize: FONT_SIZE.default,
} as const satisfies AppearanceSettings;

export const APPEARANCE_SETTINGS_STORAGE_KEY = "local:newtab:settings:appearance:v1";
