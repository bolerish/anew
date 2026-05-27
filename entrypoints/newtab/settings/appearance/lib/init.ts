import { DEFAULT_APPEARANCE_SETTINGS } from "./constants";
import { sanitizeAppearanceSettings } from "./sanitize";
import { appearanceStorage } from "./storage";
import type { AppearanceSettings } from "./types";
import { syncAppearanceStyles } from "./update";

let initialAppearanceSettings: AppearanceSettings = DEFAULT_APPEARANCE_SETTINGS;

export function initAppearanceSettings(): AppearanceSettings {
  return initialAppearanceSettings;
}

export async function loadInitialAppearanceSettings(): Promise<void> {
  initialAppearanceSettings = sanitizeAppearanceSettings(await appearanceStorage.getValue());
  syncAppearanceStyles(initialAppearanceSettings);
}
