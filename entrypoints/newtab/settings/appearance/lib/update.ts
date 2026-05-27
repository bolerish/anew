import { syncFontFamily } from "./font";
import { sanitizeAppearanceSettings } from "./sanitize";
import { appearanceStorage } from "./storage";
import type { AppearanceSettings } from "./types";

export async function updateAppearanceSetting<K extends keyof AppearanceSettings>(
  settingName: K,
  value: AppearanceSettings[K],
): Promise<void> {
  const currentSettings = await appearanceStorage.getValue();
  await syncAppearanceSettings({ ...currentSettings, [settingName]: value });
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
  if (settings.fontSize !== undefined) {
    syncFontSizeCssVariable(rootStyle, settings.fontSize);
  }
  if (settings.fontFamily !== undefined) {
    syncFontFamily(rootStyle, settings.fontFamily);
  }
}

function syncFontSizeCssVariable(rootStyle: CSSStyleDeclaration, fontSize: AppearanceSettings["fontSize"]): void {
  if (fontSize === null) {
    rootStyle.removeProperty("--mds-content-font-size");
  } else {
    rootStyle.setProperty("--mds-content-font-size", `${fontSize}px`);
  }
}
