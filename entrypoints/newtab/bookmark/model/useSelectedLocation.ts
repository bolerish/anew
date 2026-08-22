import { useEffect, useState } from "react";

import { storage } from "#imports";

import { resolveLocationId } from "../lib/bookmark-tree";
import type { BookmarkLocation } from "./bookmark-model";

const bookmarkLocationStorage = storage.defineItem<string | null>("local:newtab:bookmark-source-id:v1", {
  fallback: null,
});

type SelectedLocationState = {
  selectedLocationId: string | null;
  selectedLocationTitle: string | null;
  setSelectedLocation: (locationId: string) => void;
};

export function useSelectedLocation(locations: BookmarkLocation[]): SelectedLocationState {
  const [storedLocationId, setStoredLocationId] = useState<string | null>(bookmarkLocationStorage.fallback);
  const selectedLocationId = resolveLocationId(locations, storedLocationId);
  const selectedLocationTitle = resolveSelectedLocationTitle(locations, selectedLocationId);

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
    selectedLocationTitle,
    setSelectedLocation,
  };
}

function resolveSelectedLocationTitle(locations: BookmarkLocation[], selectedLocationId: string | null): string | null {
  return locations.find((location) => location.id === selectedLocationId)?.title ?? null;
}
