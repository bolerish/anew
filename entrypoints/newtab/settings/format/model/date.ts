import { z } from "zod";
import { notifyError } from "~shared/lib/notify-error";
import { validateStorage } from "~shared/lib/validated-storage";
import { updateStoredValue } from "~shared/lib/write-lock";

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

const DATE_FORMATS = [
  "localized-medium",
  "localized-short-weekday",
  "localized-long-weekday",
  "numeric-dot",
  "numeric-dash",
  "custom",
] as const satisfies readonly DateFormat[];

const settingsSchema = z
  .object({
    customDateFormat: z.string().catch(DEFAULT_DATE_SETTINGS.customDateFormat),
    dateFormat: z.enum(DATE_FORMATS).catch(DEFAULT_DATE_SETTINGS.dateFormat),
    showDate: z.boolean().catch(true),
  })
  .catch(() => ({ ...DEFAULT_DATE_SETTINGS }));

export const dateStorage = validateStorage(
  storage.defineItem<DateSettings>(DATE_SETTINGS_STORAGE_KEY, {
    fallback: DEFAULT_DATE_SETTINGS,
  }),
  settingsSchema,
);

export function getInitialDateSettings(): DateSettings {
  return initialDateSettings;
}

export async function loadInitialDateSettings(): Promise<void> {
  initialDateSettings = sanitizeDateSettings(await dateStorage.getValue());
}

export async function updateDateSetting<SettingName extends keyof DateSettings>(
  settingName: SettingName,
  value: DateSettings[SettingName],
): Promise<void> {
  try {
    await updateStoredValue(dateStorage, (settings) =>
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
  return settingsSchema.parse(value);
}
