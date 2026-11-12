import { z } from "zod";
import { notifyError } from "~shared/lib/notify-error";
import { updateStoredValue } from "~shared/lib/write-lock";

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
    await updateStoredValue(shortcutStorage, (settings) =>
      sanitizeShortcutSettings({
        ...settings,
        [settingName]: value,
      }),
    );
  } catch (error) {
    await notifyError(error);
  }
}

const settingsSchema = z
  .object({
    showShortcutHints: z.boolean().catch(true),
  })
  .catch(() => ({ ...DEFAULT_SHORTCUT_SETTINGS }));

function sanitizeShortcutSettings(value: unknown): ShortcutSettings {
  return settingsSchema.parse(value);
}
