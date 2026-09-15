import { notifyError } from "~shared/lib/notify-error";

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
    const settings = await timeStorage.getValue();

    await timeStorage.setValue(
      sanitizeTimeSettings({
        ...settings,
        ...patch,
      }),
    );
  } catch (error) {
    await notifyError(error);
  }
}

function sanitizeTimeSettings(value: unknown): TimeSettings {
  const settings = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    showTime: typeof settings.showTime === "boolean" ? settings.showTime : DEFAULT_TIME_SETTINGS.showTime,
    showTimeSeconds:
      typeof settings.showTimeSeconds === "boolean" ? settings.showTimeSeconds : DEFAULT_TIME_SETTINGS.showTimeSeconds,
    timeFormat: settings.timeFormat === "24h" ? "24h" : DEFAULT_TIME_SETTINGS.timeFormat,
  };
}
