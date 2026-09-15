import { useEffect, useState } from "react";

import { searchCities, MIN_CITY_QUERY_LENGTH } from "../api/weather";
import type { City } from "./weather";

const SEARCH_DELAY_MS = 400;
export function useCitySearch(query: string, language: string, enabled: boolean) {
  const [cities, setCities] = useState<City[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "empty" | "error" | "ready">("idle");
  useEffect(() => {
    setCities([]);
    setStatus("idle");
    if (!enabled || query.trim().length < MIN_CITY_QUERY_LENGTH) return;
    setStatus("loading");
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const results = await searchCities(query, language, controller.signal);
        if (controller.signal.aborted) return;
        setCities(results);
        setStatus(results.length ? "ready" : "empty");
      } catch {
        if (!controller.signal.aborted) setStatus("error");
      }
    }, SEARCH_DELAY_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, language, enabled]);
  return { cities, status };
}
