import { storage } from "#imports";

import { fetchWeather } from "../api/weather";

export const CACHE_MS = 60 * 60 * 1000;
const FAHRENHEIT_SCALE = 9 / 5;
const FAHRENHEIT_OFFSET = 32;
const RETRY_DELAY_MS = 15 * 60 * 1000;

export type City = { name: string; latitude: number; longitude: number };
export type WeatherSettings = {
  enabled: boolean;
  city: City | null;
  unit?: "celsius" | "fahrenheit";
  showCity?: boolean;
};
export type Weather = { key: string; temperature: number; code: number; fetchedAt: number };
type Cache = { weather: Weather | null; retryAt: number; key: string };
export const defaults: WeatherSettings = { enabled: false, city: null };
export const weatherSettings = storage.defineItem<WeatherSettings>("local:weather:settings", { fallback: defaults });
const cache = storage.defineItem<Cache>("local:weather:cache", { fallback: { weather: null, retryAt: 0, key: "" } });
export function formatTemperature(celsius: number, unit: "celsius" | "fahrenheit" = "celsius") {
  return `${Math.round(unit === "fahrenheit" ? celsius * FAHRENHEIT_SCALE + FAHRENHEIT_OFFSET : celsius)}°${unit === "fahrenheit" ? "F" : "C"}`;
}

export function isFresh(weather: Weather | null, key: string, now = Date.now()) {
  return Boolean(weather && weather.key === key && now >= weather.fetchedAt && now - weather.fetchedAt < CACHE_MS);
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
