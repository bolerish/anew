export const MAX_LATITUDE = 90;
export const MAX_LONGITUDE = 180;

const LOCATION_TIMEOUT_MS = 10_000;
const LOCATION_MAX_AGE_MS = 60 * 60 * 1000;
const COORDINATE_PRECISION = 100;

/** Read approximate coordinates once after an explicit location request. */
export function fetchCoordinates(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({
          latitude: Math.round(coords.latitude * COORDINATE_PRECISION) / COORDINATE_PRECISION,
          longitude: Math.round(coords.longitude * COORDINATE_PRECISION) / COORDINATE_PRECISION,
        }),
      reject,
      { enableHighAccuracy: false, maximumAge: LOCATION_MAX_AGE_MS, timeout: LOCATION_TIMEOUT_MS },
    );
  });
}
