import { withMinWriteLock } from "~shared/lib/write-lock";

import { DEFAULT_APPEARANCE_SETTINGS } from "./constants";
import { sanitizeAppearanceSettings } from "./sanitize";
import { appearanceStorage } from "./storage";
import type { AppearanceSettings } from "./types";
import { syncAppearanceStyles } from "./update";

let initialAppearanceSettings: AppearanceSettings = DEFAULT_APPEARANCE_SETTINGS;

export function getInitialAppearanceSettings(): AppearanceSettings {
  return initialAppearanceSettings;
}

export async function loadInitialAppearanceSettings(): Promise<void> {
  initialAppearanceSettings = await withMinWriteLock(async () => {
    const stored = await appearanceStorage.getValue();
    const settings = sanitizeAppearanceSettings(stored);
    if (stored && typeof stored === "object" && "headingFontFamily" in stored) {
      await appearanceStorage.setValue(settings);
    }
    return settings;
  });
  syncAppearanceStyles(initialAppearanceSettings);
}
