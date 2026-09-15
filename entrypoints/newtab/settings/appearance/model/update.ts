import { notifyError } from "~shared/lib/notify-error";

import { sanitizeAppearanceSettings } from "./sanitize";
import { appearanceStorage } from "./storage";
import type { AppearanceSettings } from "./types";

export async function updateAppearanceSetting<K extends keyof AppearanceSettings>(
  settingName: K,
  value: AppearanceSettings[K],
): Promise<void> {
  try {
    const currentSettings = sanitizeAppearanceSettings(await appearanceStorage.getValue());
    await syncAppearanceSettings({ ...currentSettings, [settingName]: value });
  } catch (error) {
    await notifyError(error);
  }
}

export async function syncAppearanceSettings(settings: AppearanceSettings): Promise<void> {
  const sanitizedSettings = sanitizeAppearanceSettings(settings);
  await appearanceStorage.setValue(sanitizedSettings);
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
      rootStyle.setProperty("--mds-heading-font-family", settings.headingFontFamily.trim());
    else rootStyle.removeProperty("--mds-heading-font-family");
  }
  if (settings.fontFamily !== undefined) {
    const fontFamily = settings.fontFamily.trim();
    if (fontFamily) rootStyle.setProperty("--mds-font-family", fontFamily);
    else rootStyle.removeProperty("--mds-font-family");
  }
}
