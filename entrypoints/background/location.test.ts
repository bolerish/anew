import { expect, test, vi } from "vitest";
import { browser } from "wxt/browser";

import background from "./index";
vi.mock("./seed-dev-bookmarks", () => ({ seedDevBookmarks: vi.fn<() => void>() }));
test("concurrent GPS calls share one temporary document and close it on failure too", async () => {
  let open = false;
  Object.defineProperty(browser, "offscreen", {
    configurable: true,
    value: {
      hasDocument: vi.fn<() => void>(),
      createDocument: vi.fn<() => void>(),
      closeDocument: vi.fn<() => void>(),
    },
  });
  vi.spyOn(browser.offscreen, "hasDocument").mockImplementation(async () => open);
  const create = vi.spyOn(browser.offscreen, "createDocument").mockImplementation(async () => {
    open = true;
  });
  const close = vi.spyOn(browser.offscreen, "closeDocument").mockImplementation(async () => {
    open = false;
  });
  const send = vi
    .spyOn(browser.runtime, "sendMessage")
    .mockImplementation(async () => ({ latitude: 37.57, longitude: 126.98 }));
  const add = vi.spyOn(browser.runtime.onMessage, "addListener");
  background.main();
  const listener = add.mock.calls[0][0];
  const sender = { id: browser.runtime.id };
  const first = listener({ type: "min:location" }, sender, vi.fn<() => void>());
  const second = listener({ type: "min:location" }, sender, vi.fn<() => void>());
  expect(first).toBe(second);
  await first;
  expect(create).toHaveBeenCalledOnce();
  expect(close).toHaveBeenCalledOnce();
  send.mockRejectedValue(new Error("unavailable"));
  await expect(listener({ type: "min:location" }, sender, vi.fn<() => void>())).rejects.toThrow("unavailable");
  expect(close).toHaveBeenCalledTimes(2);
  expect(open).toBe(false);
});
