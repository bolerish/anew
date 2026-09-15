import { clamp } from "es-toolkit";
import { useStorageValue } from "~shared/hooks/useStorageValue";
import { notifyError } from "~shared/lib/notify-error";

import { storage } from "#imports";

import { getMessages } from "../i18n";

export const languages = { ko: "한국어", en: "English", zh: "中文", ja: "日本語", es: "Español" };
const MOTION_MODES = ["system", "on", "off"] as const;
const SEARCH_ENGINES = ["google", "bing", "duckduckgo", "brave"] as const;
const ENGINE_DISPLAYS = ["logo", "none", "letter"] as const;
export const CONTENT_WIDTH = { min: 50, max: 100, default: 85, legacyNarrow: 65 } as const;

export type Language = keyof typeof languages;
export type Preferences = {
  language: Language;
  motion: (typeof MOTION_MODES)[number];
  width: number;
  engine: (typeof SEARCH_ENGINES)[number];
  searchEnabled: boolean;
  folderDividers: boolean;
  engineDisplay: (typeof ENGINE_DISPLAYS)[number];
};
const browserLanguage = navigator.language.split("-")[0];
export const preferenceDefaults: Preferences = {
  language: Object.hasOwn(languages, browserLanguage) ? (browserLanguage as Language) : "en",
  motion: "system",
  width: CONTENT_WIDTH.default,
  engine: "google",
  searchEnabled: true,
  folderDividers: false,
  engineDisplay: "logo",
};
export const preferenceStorage = storage.defineItem<Preferences>("local:newtab:preferences:v1", {
  fallback: preferenceDefaults,
});
let initialPreferences = preferenceDefaults;
export async function loadInitialPreferences() {
  initialPreferences = sanitizePreferences(await preferenceStorage.getValue());
}
export function getInitialPreferences() {
  return initialPreferences;
}
/** Validate persisted settings and migrate the previous named width choices. */
export function sanitizePreferences(value: unknown): Preferences {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ...preferenceDefaults };
  const input = value as Record<string, unknown>;
  const language = (Object.keys(languages) as Language[]).find((language) => language === input.language);
  return {
    language: language ?? preferenceDefaults.language,
    motion: MOTION_MODES.find((mode) => mode === input.motion) ?? preferenceDefaults.motion,
    engine: SEARCH_ENGINES.find((engine) => engine === input.engine) ?? preferenceDefaults.engine,
    engineDisplay:
      ENGINE_DISPLAYS.find((display) => display === input.engineDisplay) ?? preferenceDefaults.engineDisplay,
    searchEnabled: input.searchEnabled !== false,
    folderDividers: input.folderDividers === true,
    width: sanitizeContentWidth(input.width),
  };
}

function sanitizeContentWidth(value: unknown): number {
  if (value === "narrow") return CONTENT_WIDTH.legacyNarrow;
  if (value === "wide") return CONTENT_WIDTH.max;
  if (typeof value !== "number" || !Number.isFinite(value)) return CONTENT_WIDTH.default;
  return clamp(value, CONTENT_WIDTH.min, CONTENT_WIDTH.max);
}

export async function updatePreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
  try {
    await preferenceStorage.setValue(sanitizePreferences({ ...(await preferenceStorage.getValue()), [key]: value }));
  } catch (error) {
    await notifyError(error);
  }
}
export function usePreferences() {
  return sanitizePreferences(useStorageValue(preferenceStorage, getInitialPreferences));
}
export function useLanguage() {
  return getMessages(usePreferences().language);
}
