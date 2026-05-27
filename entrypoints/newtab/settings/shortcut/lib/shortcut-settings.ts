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

async function fetchShortcutSettings(): Promise<ShortcutSettings> {
  return shortcutStorage.getValue();
}

export async function updateShortcutSetting<SettingName extends keyof ShortcutSettings>(
  settingName: SettingName,
  value: ShortcutSettings[SettingName],
): Promise<void> {
  const settings = await fetchShortcutSettings();

  await updateShortcutSettings({
    ...settings,
    [settingName]: value,
  });
}

export async function updateShortcutSettings(settings: ShortcutSettings): Promise<void> {
  await shortcutStorage.setValue(sanitizeShortcutSettings(settings));
}

function sanitizeShortcutSettings(settings: Partial<ShortcutSettings>): ShortcutSettings {
  return {
    showShortcutHints: sanitizeBoolean(settings.showShortcutHints, DEFAULT_SHORTCUT_SETTINGS.showShortcutHints),
  };
}

function sanitizeBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}
