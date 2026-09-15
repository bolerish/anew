import { fetchCoordinates } from "~shared/lib/geolocation";

import { browser } from "#imports";

import type { City } from "../model/weather";
import { fetchCityName } from "./weather";

export async function fetchCurrentCity(language: string): Promise<City> {
  if (!(await browser.permissions.contains({ permissions: ["geolocation"] }))) {
    const error = new Error("Reload the extension to apply its geolocation permission.");
    error.name = "GeolocationPermissionError";
    throw error;
  }
  const coordinates = await fetchCoordinates();
  return fetchCityName(coordinates, language);
}
