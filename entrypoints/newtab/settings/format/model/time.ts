import { z } from "zod";
import { notifyError } from "~shared/lib/notify-error";
import { updateStoredValue } from "~shared/lib/write-lock";

import { storage } from "#imports";

export type TimeFormat = "24h" | "12h";
export type TimeSettings = {
  showTime: boolean;
  showTimeSeconds: boolean;
  timeFormat: TimeFormat;
};

const DEFAULT_TIME_SETTINGS = {
  showTime: true,
  showTimeSeconds: false,
  timeFormat: "12h",
} satisfies TimeSettings;

let initialTimeSettings: TimeSettings = DEFAULT_TIME_SETTINGS;

export function getInitialTimeSettings(): TimeSettings {
  return initialTimeSettings;
}

export const TIME_SETTINGS_STORAGE_KEY = "local:newtab:settings:time:v1";

export const timeStorage = storage.defineItem<TimeSettings>(TIME_SETTINGS_STORAGE_KEY, {
  fallback: DEFAULT_TIME_SETTINGS,
});

export async function loadInitialTimeSettings(): Promise<void> {
  initialTimeSettings = sanitizeTimeSettings(await timeStorage.getValue());
}

export async function updateTimeSetting<SettingName extends keyof TimeSettings>(
  settingName: SettingName,
  value: TimeSettings[SettingName],
): Promise<void> {
  await updateTimeSettings({ [settingName]: value });
}

export async function updateTimeSettings(patch: Partial<TimeSettings>): Promise<void> {
  try {
    await updateStoredValue(timeStorage, (settings) =>
      sanitizeTimeSettings({
        ...settings,
        ...patch,
      }),
    );
  } catch (error) {
    await notifyError(error);
  }
}

const settingsSchema = z
  .object({
    showTime: z.boolean().catch(true),
    showTimeSeconds: z.boolean().catch(false),
    timeFormat: z.enum(["24h", "12h"]).catch("12h"),
  })
  .catch(() => ({ ...DEFAULT_TIME_SETTINGS }));

function sanitizeTimeSettings(value: unknown): TimeSettings {
  return settingsSchema.parse(value);
}
