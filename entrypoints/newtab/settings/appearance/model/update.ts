import { notifyError } from "~shared/lib/notify-error";
import { updateStoredValue } from "~shared/lib/write-lock";

import { sanitizeAppearanceSettings } from "./sanitize";
import { appearanceStorage } from "./storage";
import type { AppearanceSettings } from "./types";

export async function updateAppearanceSetting<K extends keyof AppearanceSettings>(
  settingName: K,
  value: AppearanceSettings[K],
): Promise<void> {
  try {
    const next = await updateStoredValue(appearanceStorage, (current) =>
      sanitizeAppearanceSettings({ ...sanitizeAppearanceSettings(current), [settingName]: value }),
    );
    syncAppearanceStyles(next);
  } catch (error) {
    await notifyError(error);
  }
}

export async function syncAppearanceSettings(settings: AppearanceSettings): Promise<void> {
  const sanitizedSettings = sanitizeAppearanceSettings(settings);
  await updateStoredValue(appearanceStorage, () => sanitizedSettings);
  syncAppearanceStyles(sanitizedSettings);
}

export function syncAppearanceStyles(settings: Partial<AppearanceSettings>): void {
  const rootStyle = document.documentElement.style;
  if (settings.cornerRadius !== undefined) {
    rootStyle.setProperty("--mds-corner-radius", `${settings.cornerRadius}px`);
  }
  if (settings.fontScale !== undefined) rootStyle.setProperty("--mds-content-scale", String(settings.fontScale));
  if (settings.headingScale !== undefined) rootStyle.setProperty("--mds-heading-scale", String(settings.headingScale));
  if (settings.headingFontFamily !== undefined) {
    if (settings.headingFontFamily.trim())
      rootStyle.setProperty("--bolerish-font-heading", settings.headingFontFamily.trim());
    else rootStyle.setProperty("--bolerish-font-heading", "system-ui");
  }
  if (settings.fontFamily !== undefined) {
    const fontFamily = settings.fontFamily.trim();
    if (fontFamily) rootStyle.setProperty("--bolerish-font-body", fontFamily);
    else rootStyle.setProperty("--bolerish-font-body", "system-ui");
  }
}
