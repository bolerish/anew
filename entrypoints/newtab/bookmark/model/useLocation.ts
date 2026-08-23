import { useEffect, useState } from "react";

import { storage } from "#imports";

import { resolveLocationId } from "../lib/tree";
import type { BookmarkLocation } from "./types";

const bookmarkLocationStorage = storage.defineItem<string | null>("local:newtab:bookmark-source-id:v1", {
  fallback: null,
});

type SelectedLocationState = {
  selectedLocationId: string | null;
  setSelectedLocation: (locationId: string) => void;
};

export function useLocation(locations: BookmarkLocation[]): SelectedLocationState {
  const [storedLocationId, setStoredLocationId] = useState<string | null>(bookmarkLocationStorage.fallback);
  const selectedLocationId = resolveLocationId(locations, storedLocationId);

  useEffect(() => {
    void loadStoredLocationId();
    return bookmarkLocationStorage.watch(setStoredLocationId);

    async function loadStoredLocationId() {
      setStoredLocationId(await bookmarkLocationStorage.getValue());
    }
  }, []);

  function setSelectedLocation(locationId: string) {
    void bookmarkLocationStorage.setValue(locationId);
  }

  return {
    selectedLocationId,
    setSelectedLocation,
  };
}
