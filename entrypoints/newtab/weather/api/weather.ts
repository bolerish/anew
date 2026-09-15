import ky from "ky";
import { MAX_LATITUDE, MAX_LONGITUDE } from "~shared/lib/geolocation";

import type { City, Weather } from "../model/weather";

export const MIN_CITY_QUERY_LENGTH = 2;
const CITY_RESULT_LIMIT = 5;
const REQUEST_TIMEOUT_MS = 10_000;
const weatherApi = ky.create({ timeout: REQUEST_TIMEOUT_MS, retry: 0 });

export async function searchCities(query: string, language: string, signal?: AbortSignal): Promise<City[]> {
  if (query.trim().length < MIN_CITY_QUERY_LENGTH) return [];
  const data = await weatherApi
    .get("https://geocoding-api.open-meteo.com/v1/search", {
      searchParams: { name: query.trim(), language, count: CITY_RESULT_LIMIT },
      signal,
    })
    .json<{ results?: unknown } | null>();
  if (!Array.isArray(data?.results)) return [];
  const cities: City[] = [];
  for (const result of data.results) {
    const city = parseCity(result);
    if (city) cities.push(city);
  }
  return cities;
}

function parseCity(value: unknown): City | null {
  if (!value || typeof value !== "object") return null;
  const { name, admin1, country, latitude, longitude } = value as Record<string, unknown>;
  if (typeof name !== "string" || !name.trim()) return null;
  if (typeof latitude !== "number" || !Number.isFinite(latitude) || Math.abs(latitude) > MAX_LATITUDE) return null;
  if (typeof longitude !== "number" || !Number.isFinite(longitude) || Math.abs(longitude) > MAX_LONGITUDE) return null;
  const address = [name, admin1, country].filter((part) => typeof part === "string" && part.trim());
  return { name: address.join(", "), latitude, longitude };
}

export async function fetchWeather(city: City): Promise<Weather> {
  const data = await weatherApi
    .get("https://api.open-meteo.com/v1/forecast", {
      searchParams: {
        latitude: city.latitude,
        longitude: city.longitude,
        current: "temperature_2m,weather_code",
        forecast_days: 1,
      },
    })
    .json<{ current?: { temperature_2m?: unknown; weather_code?: unknown } } | null>();
  const temperature = data?.current?.temperature_2m;
  const code = data?.current?.weather_code;
  if (typeof temperature !== "number" || !Number.isFinite(temperature)) throw new Error("Invalid weather temperature");
  if (typeof code !== "number" || !Number.isInteger(code)) throw new Error("Invalid weather code");
  return { key: `${city.latitude},${city.longitude}`, temperature, code, fetchedAt: Date.now() };
}

export async function fetchCityName(
  coordinates: Pick<City, "latitude" | "longitude">,
  language: string,
): Promise<City> {
  const data = await weatherApi
    .get("https://api.bigdatacloud.net/data/reverse-geocode-client", {
      searchParams: {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        localityLanguage: language,
      },
    })
    .json<{ city?: unknown; locality?: unknown; principalSubdivision?: unknown } | null>();
  const name = [data?.city, data?.locality, data?.principalSubdivision].find(
    (value): value is string => typeof value === "string" && value.trim().length > 0,
  );
  if (!name) throw new Error("City not found");
  return { name: name.trim(), latitude: coordinates.latitude, longitude: coordinates.longitude };
}
