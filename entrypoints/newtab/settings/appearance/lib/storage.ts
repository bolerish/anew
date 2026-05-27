import { storage } from "#imports";

import { DEFAULT_APPEARANCE_SETTINGS, APPEARANCE_SETTINGS_STORAGE_KEY } from "./constants";
import type { AppearanceSettings } from "./types";

export const appearanceStorage = storage.defineItem<AppearanceSettings>(APPEARANCE_SETTINGS_STORAGE_KEY, {
  fallback: DEFAULT_APPEARANCE_SETTINGS,
});
