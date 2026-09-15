import { type AppearanceSettings } from "./types";

export const CORNER_RADIUS = { default: 0, min: 0, max: 12 } as const;
export const TEXT_SCALE = { default: 1, min: 0.75, max: 1.5, step: 0.05 } as const;

export const DEFAULT_APPEARANCE_SETTINGS = {
  bookmarkIconDisplayMode: "original",
  cornerRadius: CORNER_RADIUS.default,
  fontFamily: "",
  headingFontFamily: "",
  fontScale: TEXT_SCALE.default,
  headingScale: TEXT_SCALE.default,
} as const satisfies AppearanceSettings;

export const APPEARANCE_SETTINGS_STORAGE_KEY = "local:newtab:settings:appearance:v1";
