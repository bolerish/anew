import { useEffect, useState } from "react";
import type { Language } from "~shared/lib/preferences";

import { localizeCity } from "../api/weather";
import { weatherSettings, loadWeather, type City, type Weather, type WeatherSettings } from "./weather";

export function useWeather(settings: WeatherSettings, language: Language) {
  const [data, setData] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const city = settings.city;
    if (!settings.enabled || !city || city.language === language) return;
    let active = true;
    async function updateCityName(savedCity: City) {
      try {
        const localizedCity = await localizeCity(savedCity, language);
        if (!active || !localizedCity) return;

        const currentSettings = await weatherSettings.getValue();
        if (!active) return;
        const currentCity = currentSettings.city;
        if (!currentCity || currentCity.name !== savedCity.name) return;
        if (currentCity.latitude !== savedCity.latitude || currentCity.longitude !== savedCity.longitude) return;

        await weatherSettings.setValue({ ...currentSettings, city: localizedCity });
      } catch {
        // Keep the saved name when lookup or persistence fails.
      }
    }

    void updateCityName(city);
    return () => {
      active = false;
    };
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
