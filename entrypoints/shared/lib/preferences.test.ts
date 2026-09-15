/* oxlint-disable no-await-in-loop -- Sequential writes verify that later updates preserve earlier settings. */
import { expect, test } from "vitest";

import {
  preferenceDefaults,
  preferenceStorage,
  sanitizePreferences,
  updatePreference,
  loadInitialPreferences,
  getInitialPreferences,
} from "./preferences";

test("invalid stored values use defaults; old widths migrate and numeric widths clamp", () => {
  for (const value of [null, undefined, 1, [], "invalid", { language: "xx", width: NaN, engine: "custom" }]) {
    expect(sanitizePreferences(value)).toEqual(preferenceDefaults);
  }
  for (const [input, width] of [
    ["narrow", 65],
    ["wide", 100],
    [0, 50],
    [500, 100],
    [73, 73],
  ] as const) {
    expect(sanitizePreferences({ width: input }).width).toBe(width);
  }
});
test("independent updates preserve language, engine, and migrated width", async () => {
  await preferenceStorage.setValue({ ...preferenceDefaults, language: "ja", width: 73 });
  await loadInitialPreferences();
  expect(getInitialPreferences().language).toBe("ja");
  for (const language of ["ko", "en", "ja", "zh", "es"] as const) {
    await updatePreference("language", language);
    expect(await preferenceStorage.getValue()).toMatchObject({ language, width: 73, engine: "google" });
  }
  await updatePreference("searchEnabled", false);
  await updatePreference("engineDisplay", "none");
  await updatePreference("motion", "off");
  expect(await preferenceStorage.getValue()).toMatchObject({
    searchEnabled: false,
    engineDisplay: "none",
    motion: "off",
  });
});
