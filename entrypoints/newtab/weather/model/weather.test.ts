import { expect, test, vi } from "vitest";

import { weatherSettings, defaults, formatTemperature, loadWeather, CACHE_MS } from "./weather";
test("weather caches across tabs, backs off errors and stays idle when disabled", async () => {
  let queue = Promise.resolve<unknown>(null);
  Object.defineProperty(navigator, "locks", {
    configurable: true,
    value: {
      request: (_: string, run: () => Promise<unknown>) => (queue = queue.then(run)),
    },
  });
  let now = 100000000;
  vi.spyOn(Date, "now").mockImplementation(() => now);
  const fetch = vi
    .fn<typeof globalThis.fetch>()
    .mockImplementation(async () => new Response(JSON.stringify({ current: { temperature_2m: 22, weather_code: 0 } })));
  vi.stubGlobal("fetch", fetch);
  expect(await loadWeather()).toBeNull();
  expect(fetch).not.toHaveBeenCalled();
  await weatherSettings.setValue({
    ...defaults,
    enabled: true,
    city: { name: "Seoul", latitude: 37.57, longitude: 126.98 },
  });
  const [first, second] = await Promise.all([loadWeather(), loadWeather()]);
  expect(first?.temperature).toBe(22);
  expect(second).toEqual(first);
  expect(fetch).toHaveBeenCalledTimes(1);
  now += CACHE_MS;
  fetch.mockRejectedValue(new Error("offline"));
  expect(await loadWeather()).toEqual(first);
  await loadWeather();
  expect(fetch).toHaveBeenCalledTimes(2);
  now += 15 * 60 * 1000;
  fetch.mockImplementation(
    async () => new Response(JSON.stringify({ current: { temperature_2m: 24, weather_code: 0 } })),
  );
  expect((await loadWeather())?.temperature).toBe(24);
  await weatherSettings.setValue({ ...defaults, enabled: false });
  await loadWeather();
  expect(fetch).toHaveBeenCalledTimes(3);
});
test.each([
  [0, "celsius", "0°C"],
  [0, "fahrenheit", "32°F"],
  [-40, "fahrenheit", "-40°F"],
] as const)("formats %s %s", (value, unit, expected) => {
  expect(formatTemperature(value, unit)).toBe(expected);
});
