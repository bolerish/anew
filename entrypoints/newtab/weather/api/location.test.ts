import { expect, test, vi } from "vitest";
import { browser } from "wxt/browser";

import { fetchCurrentCity } from "./location";
test("GPS resolves a city name and rejects denied permissions", async () => {
  vi.spyOn(browser.permissions, "contains").mockImplementation(async () => false);
  await expect(fetchCurrentCity("ko")).rejects.toMatchObject({ name: "GeolocationPermissionError" });
  vi.mocked(browser.permissions.contains).mockImplementation(async () => true);
  const getCurrentPosition = vi.fn<Geolocation["getCurrentPosition"]>((success) => {
    success({ coords: { latitude: 37.5665, longitude: 126.978 } } as GeolocationPosition);
  });
  Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition } });
  const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response(JSON.stringify({ city: "서울" })));
  vi.stubGlobal("fetch", fetch);
  expect(await fetchCurrentCity("ko")).toEqual({ name: "서울", latitude: 37.57, longitude: 126.98 });
  expect(getCurrentPosition).toHaveBeenCalledOnce();
  getCurrentPosition.mockImplementation((_success, failure) =>
    failure?.({ code: 1, message: "Denied" } as GeolocationPositionError),
  );
  await expect(fetchCurrentCity("ko")).rejects.toMatchObject({ code: 1 });
  expect(fetch).toHaveBeenCalledOnce();
  expect((fetch.mock.calls[0][0] as Request).url).toContain("localityLanguage=ko");
});
