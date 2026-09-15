import { expect, test, vi } from "vitest";
import { browser } from "wxt/browser";

import { fetchCurrentCity } from "./location";
test("GPS resolves a city name and rejects denied permissions", async () => {
  vi.spyOn(browser.permissions, "contains").mockImplementation(async () => false);
  await expect(fetchCurrentCity("ko")).rejects.toMatchObject({ name: "GeolocationPermissionError" });
  vi.mocked(browser.permissions.contains).mockImplementation(async () => true);
  vi.spyOn(browser.runtime, "getManifest").mockReturnValue({
    manifest_version: 3,
    name: "MIN",
    version: "1",
    permissions: ["offscreen"],
  });
  vi.spyOn(browser.runtime, "sendMessage").mockImplementation(async () => ({ latitude: 37.57, longitude: 126.98 }));
  const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response(JSON.stringify({ city: "서울" })));
  vi.stubGlobal("fetch", fetch);
  expect(await fetchCurrentCity("ko")).toEqual({ name: "서울", latitude: 37.57, longitude: 126.98 });
  expect((fetch.mock.calls[0][0] as Request).url).toContain("localityLanguage=ko");
});
