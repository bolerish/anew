import { fetchCoordinates, MAX_LATITUDE, MAX_LONGITUDE, POSITION_UNAVAILABLE } from "~shared/lib/geolocation";

import { browser } from "#imports";

import type { City } from "../model/weather";
import { fetchCityName } from "./weather";

export async function fetchCurrentCity(language: string): Promise<City> {
  if (!(await browser.permissions.contains({ permissions: ["geolocation"] }))) {
    const error = new Error("Reload the extension to apply its geolocation permission.");
    error.name = "GeolocationPermissionError";
    throw error;
  }
  let coordinates: { latitude: number; longitude: number };
  if (browser.runtime.getManifest().permissions?.includes("offscreen")) {
    const result = await browser.runtime.sendMessage({ type: "min:location" });
    if (!Number.isFinite(result?.latitude) || !Number.isFinite(result?.longitude)) {
      throw Object.assign(new Error(result?.message ?? "Location unavailable"), {
        code: result?.code ?? POSITION_UNAVAILABLE,
      });
    }
    if (Math.abs(result.latitude) > MAX_LATITUDE || Math.abs(result.longitude) > MAX_LONGITUDE)
      throw new Error("Invalid location");
    coordinates = result;
  } else {
    coordinates = await fetchCoordinates();
  }
  return fetchCityName(coordinates, language);
}
