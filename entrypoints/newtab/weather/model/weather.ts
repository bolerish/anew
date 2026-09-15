import { z } from "zod";
import { MAX_LATITUDE, MAX_LONGITUDE } from "~shared/lib/geolocation";
import { validateStorage } from "~shared/lib/validated-storage";

import { storage } from "#imports";

import { fetchWeather } from "../api/weather";

export const CACHE_MS = 60 * 60 * 1000;
const FAHRENHEIT_SCALE = 9 / 5;
const FAHRENHEIT_OFFSET = 32;
const RETRY_DELAY_MS = 15 * 60 * 1000;

export const citySchema = z.object({
  name: z.string().min(1),
  latitude: z.number().min(-MAX_LATITUDE).max(MAX_LATITUDE),
  longitude: z.number().min(-MAX_LONGITUDE).max(MAX_LONGITUDE),
  language: z.string().optional(),
});
export type City = z.output<typeof citySchema>;
export const weatherSettingsSchema = z
  .object({
    enabled: z.boolean().catch(false),
    city: citySchema.nullable().catch(null),
    unit: z.enum(["celsius", "fahrenheit"]).optional().catch(undefined),
    showCity: z.boolean().optional().catch(undefined),
  })
  .catch({ enabled: false, city: null });
export type WeatherSettings = z.output<typeof weatherSettingsSchema>;
export const weatherSchema = z.object({
  key: z.string(),
  temperature: z.number(),
  code: z.number().refine(Number.isInteger),
  fetchedAt: z.number().nonnegative(),
});
export type Weather = z.output<typeof weatherSchema>;
const cacheSchema = z
  .object({
    weather: weatherSchema.nullable().catch(null),
    retryAt: z.number().nonnegative().catch(0),
    key: z.string().catch(""),
  })
  .catch({ weather: null, retryAt: 0, key: "" });
export const defaults: WeatherSettings = { enabled: false, city: null };
export const weatherSettings = validateStorage(
  storage.defineItem<WeatherSettings>("local:weather:settings", { fallback: defaults }),
  weatherSettingsSchema,
);
const cache = validateStorage(
  storage.defineItem<z.output<typeof cacheSchema>>("local:weather:cache", {
    fallback: { weather: null, retryAt: 0, key: "" },
  }),
  cacheSchema,
);
export function formatTemperature(celsius: number, unit: "celsius" | "fahrenheit" = "celsius") {
  const isFahrenheit = unit === "fahrenheit";
  const temperature = isFahrenheit ? celsius * FAHRENHEIT_SCALE + FAHRENHEIT_OFFSET : celsius;
  const symbol = isFahrenheit ? "F" : "C";
  return `${Math.round(temperature)}°${symbol}`;
}

export function isFresh(weather: Weather | null, key: string, now = Date.now()) {
  if (!weather || weather.key !== key) return false;
  const age = now - weather.fetchedAt;
  return age >= 0 && age < CACHE_MS;
}
export async function loadWeather(): Promise<Weather | null> {
  return navigator.locks.request("min-weather", async () => {
    const { enabled, city } = await weatherSettings.getValue();
    if (!enabled || !city) return null;
    const key = `${city.latitude},${city.longitude}`;
    const saved = await cache.getValue();
    const previous = saved.weather?.key === key ? saved.weather : null;
    if (isFresh(previous, key) || (saved.key === key && Date.now() < saved.retryAt)) return previous;
    // Cache failed attempts too, so repeated new tabs do not hammer an unavailable API.
    await cache.setValue({ weather: previous, key, retryAt: Date.now() + RETRY_DELAY_MS });
    try {
      const weather = await fetchWeather(city);
      await cache.setValue({ weather, key, retryAt: 0 });
      return weather;
    } catch {
      return previous;
    }
  });
}
