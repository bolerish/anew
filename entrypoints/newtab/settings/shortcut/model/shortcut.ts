import { notifyError } from "~shared/lib/notify-error";

import { storage } from "#imports";

export type ShortcutSettings = {
  showShortcutHints: boolean;
};

const DEFAULT_SHORTCUT_SETTINGS = {
  showShortcutHints: true,
} satisfies ShortcutSettings;

let initialShortcutSettings: ShortcutSettings = DEFAULT_SHORTCUT_SETTINGS;

export function getInitialShortcutSettings(): ShortcutSettings {
  return initialShortcutSettings;
}

export const SHORTCUT_SETTINGS_STORAGE_KEY = "local:newtab:settings:shortcut:v1";

export const shortcutStorage = storage.defineItem<ShortcutSettings>(SHORTCUT_SETTINGS_STORAGE_KEY, {
  fallback: DEFAULT_SHORTCUT_SETTINGS,
});

export async function loadInitialShortcutSettings(): Promise<void> {
  initialShortcutSettings = sanitizeShortcutSettings(await shortcutStorage.getValue());
}

export async function updateShortcutSetting<SettingName extends keyof ShortcutSettings>(
  settingName: SettingName,
  value: ShortcutSettings[SettingName],
): Promise<void> {
  try {
    const settings = await shortcutStorage.getValue();

    await shortcutStorage.setValue(
      sanitizeShortcutSettings({
        ...settings,
        [settingName]: value,
      }),
    );
  } catch (error) {
    await notifyError(error);
  }
}

function sanitizeShortcutSettings(value: unknown): ShortcutSettings {
  const settings = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    showShortcutHints:
      typeof settings.showShortcutHints === "boolean"
        ? settings.showShortcutHints
        : DEFAULT_SHORTCUT_SETTINGS.showShortcutHints,
  };
}
