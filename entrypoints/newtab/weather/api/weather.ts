import ky from "ky";
import { z } from "zod";
import { MAX_LATITUDE, MAX_LONGITUDE } from "~shared/lib/geolocation";

import type { City, Weather } from "../model/weather";

export const MIN_CITY_QUERY_LENGTH = 2;
const CITY_RESULT_LIMIT = 5;
const LOCATION_MATCH_TOLERANCE_DEGREES = 0.1;
const REQUEST_TIMEOUT_MS = 10_000;
const weatherApi = ky.create({ timeout: REQUEST_TIMEOUT_MS, retry: 0 });
const locationNameSchema = z.string().trim().min(1);
export const searchCitySchema = z.object({
  name: locationNameSchema,
  latitude: z.number().min(-MAX_LATITUDE).max(MAX_LATITUDE),
  longitude: z.number().min(-MAX_LONGITUDE).max(MAX_LONGITUDE),
  admin1: locationNameSchema.optional().catch(undefined),
  country: locationNameSchema.optional().catch(undefined),
});
const citySearchResponseSchema = z.object({ results: z.array(z.unknown()).catch([]) }).catch({ results: [] });
export const weatherResponseSchema = z.object({
  current: z.object({
    temperature_2m: z.number(),
    weather_code: z.number().refine(Number.isInteger),
  }),
});
export const cityNameResponseSchema = z.object({
  city: locationNameSchema.optional().catch(undefined),
  locality: locationNameSchema.optional().catch(undefined),
  principalSubdivision: locationNameSchema.optional().catch(undefined),
  countryName: locationNameSchema.optional().catch(undefined),
});

export async function searchCities(query: string, language: string, signal?: AbortSignal): Promise<City[]> {
  const name = query.trim();
  if (name.length < MIN_CITY_QUERY_LENGTH) return [];
  const data = await weatherApi
    .get("https://geocoding-api.open-meteo.com/v1/search", {
      searchParams: { name, language, count: CITY_RESULT_LIMIT },
      signal,
    })
    .json<unknown>();
  const { results } = citySearchResponseSchema.parse(data);
  const cities: City[] = [];
  for (const result of results) {
    const city = parseCity(result, language);
    if (city) cities.push(city);
  }
  return cities;
}

function parseCity(value: unknown, language: string): City | null {
  const result = searchCitySchema.safeParse(value);
  if (!result.success) return null;
  const { name, admin1, country, latitude, longitude } = result.data;
  return { name: formatLocationName([name, admin1, country]), latitude, longitude, language };
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
    .json<unknown>();
  const result = weatherResponseSchema.safeParse(data);
  if (!result.success) throw new Error("Invalid weather response", { cause: result.error });
  const { temperature_2m: temperature, weather_code: code } = result.data.current;
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
    .json<unknown>();
  const location = cityNameResponseSchema.parse(data);
  const name = location.city ?? location.locality ?? location.principalSubdivision;
  if (!name) throw new Error("City not found");
  return {
    name: formatLocationName([name, location.principalSubdivision, location.countryName]),
    ...coordinates,
    language,
  };
}

function formatLocationName(parts: readonly unknown[]): string {
  const names = new Set<string>();
  for (const part of parts) {
    if (typeof part !== "string") continue;
    const name = part.trim();
    if (name) names.add(name);
  }
  return [...names].join(", ");
}

// ponytail: match one nearby search result; use stable place IDs if names become ambiguous.
export async function localizeCity(city: City, language: string): Promise<City | null> {
  const [searchName] = city.name.split(",");
  const cities = await searchCities(searchName, language);
  const matches = cities.filter((candidate) => {
    const latitudeDifference = Math.abs(candidate.latitude - city.latitude);
    const longitudeDifference = Math.abs(candidate.longitude - city.longitude);
    return Math.max(latitudeDifference, longitudeDifference) < LOCATION_MATCH_TOLERANCE_DEGREES;
  });
  if (matches.length !== 1) return null;
  return { ...city, name: matches[0].name, language };
}
