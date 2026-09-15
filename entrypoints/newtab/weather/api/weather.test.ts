import { expect, test, vi } from "vitest";

import { searchCities, fetchWeather } from "./weather";
test("city search rejects HTTP failures without retrying", async () => {
  const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async () => new Response("", { status: 503 }));
  vi.stubGlobal("fetch", fetch);
  await expect(searchCities("Seoul", "en")).rejects.toMatchObject({ name: "HTTPError" });
  expect(fetch).toHaveBeenCalledTimes(1);
});
test("city search forwards cancellation to the request", async () => {
  const controller = new AbortController();
  const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(
    (input) =>
      new Promise((_resolve, reject) => {
        const request = input as Request;
        request.signal.addEventListener("abort", () => reject(request.signal.reason), { once: true });
        controller.abort();
      }),
  );
  vi.stubGlobal("fetch", fetch);
  await expect(searchCities("Seoul", "en", controller.signal)).rejects.toMatchObject({ name: "AbortError" });
  expect((fetch.mock.calls[0][0] as Request).signal.aborted).toBe(true);
});
test("city search skips malformed entries and preserves valid address parts", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn<typeof fetch>().mockImplementation(async () =>
      Response.json({
        results: [
          null,
          {},
          { name: "Bad", latitude: 91, longitude: 0 },
          { name: "Seoul", latitude: 37.57, longitude: 126.98, admin1: {}, country: "Korea" },
        ],
      }),
    ),
  );
  expect(await searchCities("Seoul", "en")).toEqual([{ name: "Seoul, Korea", latitude: 37.57, longitude: 126.98 }]);
});

test("weather rejects invalid responses before caching", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn<typeof fetch>()
      .mockImplementation(async () => Response.json({ current: { temperature_2m: "22", weather_code: 0 } })),
  );
  await expect(fetchWeather({ name: "Seoul", latitude: 37.57, longitude: 126.98 })).rejects.toThrow("Invalid weather");
});
