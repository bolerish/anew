import { expect, test, vi } from "vitest";
import { fakeBrowser } from "wxt/testing";

import { dateStorage, getInitialDateSettings, loadInitialDateSettings, type DateSettings } from "./date";

const key = "newtab:settings:date:v1";

test("invalid saved format stays validated after initial load and watch without writing back", async () => {
  const saved = { customDateFormat: "YYYY/MM/DD", dateFormat: "invalid-saved-format", showDate: false };
  await fakeBrowser.storage.local.set({ [key]: saved });
  const write = vi.spyOn(fakeBrowser.storage.local, "set");
  await loadInitialDateSettings();
  const expected = { ...saved, dateFormat: "localized-long-weekday" };
  expect(getInitialDateSettings()).toEqual(expected);
  expect(await dateStorage.getValue()).toEqual(expected);
  const listener = vi.fn<(value: DateSettings, oldValue: DateSettings) => void>();
  const unwatch = dateStorage.watch(listener);
  fakeBrowser.storage.local.onChanged.trigger({
    [key]: { newValue: saved, oldValue: { ...saved, customDateFormat: "D" } },
  });
  await vi.waitFor(() => expect(listener).toHaveBeenCalledWith(expected, { ...expected, customDateFormat: "D" }));
  unwatch();
  expect((await fakeBrowser.storage.local.get(key))[key]).toEqual(saved);
  expect(write).not.toHaveBeenCalled();
});

test("valid custom settings survive reads and watch without writing back", async () => {
  const saved = { customDateFormat: "YYYY/MM/DD", dateFormat: "custom", showDate: false };
  await fakeBrowser.storage.local.set({ [key]: saved });
  const write = vi.spyOn(fakeBrowser.storage.local, "set");
  expect(await dateStorage.getValue()).toEqual(saved);
  const listener = vi.fn<(value: DateSettings, oldValue: DateSettings) => void>();
  const unwatch = dateStorage.watch(listener);
  fakeBrowser.storage.local.onChanged.trigger({
    [key]: { newValue: saved, oldValue: { ...saved, customDateFormat: "D" } },
  });
  await vi.waitFor(() => expect(listener).toHaveBeenCalledWith(saved, { ...saved, customDateFormat: "D" }));
  unwatch();
  expect((await fakeBrowser.storage.local.get(key))[key]).toEqual(saved);
  expect(write).not.toHaveBeenCalled();
});
