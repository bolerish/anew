import { test } from "vitest";

import { sanitizeAppearanceSettings } from "./sanitize";
import { appearanceStorage } from "./storage";
import { updateAppearanceSetting, syncAppearanceStyles } from "./update";

import assert from "node:assert/strict";
test("legacy font migration, independent edits and CSS synchronization", async () => {
  await appearanceStorage.setValue(
    JSON.parse('{"fontSize":15,"fontFamily":"","cornerRadius":0,"bookmarkIconDisplayMode":"original"}'),
  );

  assert.equal(sanitizeAppearanceSettings(await appearanceStorage.getValue()).headingScale, 15 / 12.25);
  syncAppearanceStyles(sanitizeAppearanceSettings(await appearanceStorage.getValue()));
  assert.equal(document.documentElement.style.getPropertyValue("--mds-heading-scale"), String(15 / 12.25));
  await updateAppearanceSetting("fontScale", 1.1);
  assert.equal(
    (await appearanceStorage.getValue()).headingScale,
    15 / 12.25,
    "Changing content preserves migrated heading scale",
  );
  assert.equal(document.documentElement.style.getPropertyValue("--mds-content-scale"), "1.1");
  await updateAppearanceSetting("headingScale", 1);
  assert.equal((await appearanceStorage.getValue()).fontScale, 1.1);
  assert.equal(document.documentElement.style.getPropertyValue("--mds-heading-scale"), "1");
  assert.equal("fontSize" in (await appearanceStorage.getValue()), false, "Writes remove obsolete pixel settings");
  assert.equal(sanitizeAppearanceSettings(JSON.parse('{ "fontSize":12, "dateTimeFontSize":null }')).headingScale, 1);
  assert.equal(sanitizeAppearanceSettings({ fontScale: NaN }).fontScale, 1);
  assert.equal(sanitizeAppearanceSettings({ headingScale: 100 }).headingScale, 1.5);
  assert.equal(sanitizeAppearanceSettings({ fontScale: 0 }).fontScale, 0.75);
  assert.equal(sanitizeAppearanceSettings({}).headingScale, 1);

  assert.equal(sanitizeAppearanceSettings({ fontFamily: "Legacy" }).headingFontFamily, "Legacy");
  await updateAppearanceSetting("headingFontFamily", "Heading Font");
  await updateAppearanceSetting("fontFamily", "Body Font");
  assert.equal((await appearanceStorage.getValue()).headingFontFamily, "Heading Font");
  assert.equal((await appearanceStorage.getValue()).fontFamily, "Body Font");
  assert.equal(sanitizeAppearanceSettings({ fontFamily: "Body", headingFontFamily: "" }).headingFontFamily, "");
});

test("invalid persisted appearance values fall back safely", () => {
  assert.equal(sanitizeAppearanceSettings(null).fontScale, 1);
  assert.equal(sanitizeAppearanceSettings("invalid").headingFontFamily, "");
});
