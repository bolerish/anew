import { useEffect, useRef, useState } from "react";
import type { Language } from "~shared/lib/preferences";
import { weatherMessages } from "~shared/locales/weather";

import { fetchCurrentCity } from "../api/location";
import { weatherSettings, loadWeather, type Weather, type WeatherSettings } from "./weather";

export function useWeather(settings: WeatherSettings, language: Language) {
  const resolvingLegacyCity = useRef(false);
  const [data, setData] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const city = settings.city;
    const legacyNames = Object.values(weatherMessages).map((value) => value.currentLocation);
    if (!settings.enabled || !city || !legacyNames.some((name) => name === city.name) || resolvingLegacyCity.current)
      return;
    resolvingLegacyCity.current = true;
    void fetchCurrentCity(language)
      .then(async (resolved) => {
        const current = await weatherSettings.getValue();
        if (
          current.city?.name === city.name &&
          current.city.latitude === city.latitude &&
          current.city.longitude === city.longitude
        ) {
          await weatherSettings.setValue({ ...current, city: resolved });
        }
      })
      .catch(() => {});
  }, [settings.enabled, settings.city, language]);
  useEffect(() => {
    let active = true;
    setData(null);
    setLoading(false);
    if (!settings.enabled || !settings.city) return;
    setLoading(true);
    void loadWeather()
      .then((result) => {
        if (active) setData(result);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [settings.enabled, settings.city]);
  return { data, loading };
}
