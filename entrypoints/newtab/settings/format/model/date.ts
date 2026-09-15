import { notifyError } from "~shared/lib/notify-error";

import { storage } from "#imports";

export type DateFormat =
  | "localized-medium"
  | "localized-short-weekday"
  | "localized-long-weekday"
  | "numeric-dot"
  | "numeric-dash"
  | "custom";

export type DateSettings = {
  customDateFormat: string;
  dateFormat: DateFormat;
  showDate: boolean;
};

const DEFAULT_DATE_SETTINGS = {
  customDateFormat: "MMM D, YYYY",
  dateFormat: "localized-long-weekday",
  showDate: true,
} satisfies DateSettings;

let initialDateSettings: DateSettings = DEFAULT_DATE_SETTINGS;

const DATE_SETTINGS_STORAGE_KEY = "local:newtab:settings:date:v1";

export const dateStorage = storage.defineItem<DateSettings>(DATE_SETTINGS_STORAGE_KEY, {
  fallback: DEFAULT_DATE_SETTINGS,
});

export function getInitialDateSettings(): DateSettings {
  return initialDateSettings;
}

const DATE_FORMATS = [
  "localized-medium",
  "localized-short-weekday",
  "localized-long-weekday",
  "numeric-dot",
  "numeric-dash",
  "custom",
] satisfies readonly DateFormat[];

export async function loadInitialDateSettings(): Promise<void> {
  initialDateSettings = sanitizeDateSettings(await dateStorage.getValue());
}

export async function updateDateSetting<SettingName extends keyof DateSettings>(
  settingName: SettingName,
  value: DateSettings[SettingName],
): Promise<void> {
  try {
    const settings = await dateStorage.getValue();

    await dateStorage.setValue(
      sanitizeDateSettings({
        ...settings,
        [settingName]: value,
      }),
    );
  } catch (error) {
    await notifyError(error);
  }
}

function sanitizeDateSettings(value: unknown): DateSettings {
  const settings = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    customDateFormat:
      typeof settings.customDateFormat === "string"
        ? settings.customDateFormat
        : DEFAULT_DATE_SETTINGS.customDateFormat,
    dateFormat: isDateFormat(settings.dateFormat) ? settings.dateFormat : DEFAULT_DATE_SETTINGS.dateFormat,
    showDate: typeof settings.showDate === "boolean" ? settings.showDate : DEFAULT_DATE_SETTINGS.showDate,
  };
}

function isDateFormat(value: unknown): value is DateFormat {
  return typeof value === "string" && DATE_FORMATS.includes(value as DateFormat);
}
