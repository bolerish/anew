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

async function fetchTimeSettings(): Promise<TimeSettings> {
  return timeStorage.getValue();
}

export async function updateTimeSetting<SettingName extends keyof TimeSettings>(
  settingName: SettingName,
  value: TimeSettings[SettingName],
): Promise<void> {
  const settings = await fetchTimeSettings();

  await updateTimeSettings({
    ...settings,
    [settingName]: value,
  });
}

export async function updateTimeSettings(settings: TimeSettings): Promise<void> {
  await timeStorage.setValue(sanitizeTimeSettings(settings));
}

function sanitizeTimeSettings(settings: Partial<TimeSettings>): TimeSettings {
  return {
    showTime: sanitizeBoolean(settings.showTime, DEFAULT_TIME_SETTINGS.showTime),
    showTimeSeconds: sanitizeBoolean(settings.showTimeSeconds, DEFAULT_TIME_SETTINGS.showTimeSeconds),
    timeFormat: settings.timeFormat === "24h" ? "24h" : DEFAULT_TIME_SETTINGS.timeFormat,
  };
}

function sanitizeBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}
