import { test, expect } from "vitest";

import { loadInitialAppearanceSettings } from "./init";
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
});

test("invalid persisted appearance values fall back safely", () => {
  assert.equal(sanitizeAppearanceSettings(null).fontScale, 1);
  assert.equal(sanitizeAppearanceSettings("invalid").fontFamily, "");
});

test.each([
  [{ fontFamily: " Body Font ", headingFontFamily: "Heading Font" }, "Body Font"],
  [{ fontFamily: " ", headingFontFamily: " 제목 글꼴 " }, "제목 글꼴"],
  [{ fontFamily: null, headingFontFamily: "제목 글꼴" }, "제목 글꼴"],
  [{ headingFontFamily: "Heading Font" }, "Heading Font"],
  [{ fontFamily: "본문 글꼴", headingFontFamily: "" }, "본문 글꼴"],
  [{ fontFamily: "", headingFontFamily: "" }, ""],
])("font consolidation preserves the content choice with a heading fallback: %j", (stored, fontFamily) => {
  const migrated = sanitizeAppearanceSettings({ ...stored, fontScale: 1.4, headingScale: 0.8 });
  expect(migrated).toMatchObject({ fontFamily, fontScale: 1.4, headingScale: 0.8 });
  expect(migrated).not.toHaveProperty("headingFontFamily");
  expect(sanitizeAppearanceSettings(migrated)).toEqual(migrated);
});

test("startup migration, concurrent edits and clearing cannot revive a legacy heading font", async () => {
  await appearanceStorage.setValue(
    JSON.parse('{"fontFamily":" ","headingFontFamily":"맑은 고딕","fontScale":1.4,"headingScale":0.8}'),
  );
  await Promise.all([loadInitialAppearanceSettings(), updateAppearanceSetting("cornerRadius", 5)]);
  expect(await appearanceStorage.getValue()).toMatchObject({
    fontFamily: "맑은 고딕",
    fontScale: 1.4,
    headingScale: 0.8,
    cornerRadius: 5,
  });
  expect(await appearanceStorage.getValue()).not.toHaveProperty("headingFontFamily");
  for (const variable of ["--bolerish-font-body", "--bolerish-font-heading"]) {
    expect(document.documentElement.style.getPropertyValue(variable)).toBe("맑은 고딕");
  }
  await updateAppearanceSetting("fontFamily", "");
  await Promise.all([loadInitialAppearanceSettings(), loadInitialAppearanceSettings()]);
  expect(await appearanceStorage.getValue()).toMatchObject({ fontFamily: "", fontScale: 1.4, headingScale: 0.8 });
  for (const variable of ["--bolerish-font-body", "--bolerish-font-heading"]) {
    expect(document.documentElement.style.getPropertyValue(variable)).toBe("system-ui");
  }
});

test("legacy square and current dot settings both resolve to dot", () => {
  for (const bookmarkIconDisplayMode of ["square", "dot"]) {
    assert.equal(sanitizeAppearanceSettings({ bookmarkIconDisplayMode }).bookmarkIconDisplayMode, "dot");
  }
});
