import { expect, test } from "vitest";

import {
  setFolderView,
  saveEditedBookmarkSettings,
  bookmarkSettingsStorage,
  defaults,
} from "../../newtab/settings/bookmark/model/settings";
import { updatePreference, preferenceStorage, preferenceDefaults } from "./preferences";
import { withMinWriteLock } from "./write-lock";

test("concurrent preference patches preserve each field", async () => {
  await preferenceStorage.setValue(preferenceDefaults);
  await Promise.all([
    updatePreference("width", 73),
    updatePreference("engine", "bing"),
    updatePreference("motion", "off"),
  ]);
  expect(await preferenceStorage.getValue()).toMatchObject({ width: 73, engine: "bing", motion: "off" });
});

test("editing merges changed folders into the latest settings without reverting another tab", async () => {
  await bookmarkSettingsStorage.setValue({ ...defaults, folderViews: { original: "list" } });
  const base = await bookmarkSettingsStorage.getValue();
  await setFolderView("other-tab", "icons");
  await withMinWriteLock(() =>
    saveEditedBookmarkSettings({ ...base, folderViews: { ...base.folderViews, edited: "icons" } }, base),
  );
  expect((await bookmarkSettingsStorage.getValue()).folderViews).toEqual({
    original: "list",
    "other-tab": "icons",
    edited: "icons",
  });
});
