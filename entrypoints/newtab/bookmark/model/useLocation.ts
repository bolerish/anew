import { useEffect, useState } from "react";
import { z } from "zod";
import { validateStorage } from "~shared/lib/validated-storage";

import { storage } from "#imports";

import { resolveLocationId } from "../lib/tree";
import type { BookmarkLocation } from "./types";

const locationIdSchema = z.string().min(1).nullable().catch(null);
const bookmarkLocationStorage = validateStorage(
  storage.defineItem<string | null>("local:newtab:bookmark-source-id:v1", {
    fallback: null,
  }),
  locationIdSchema,
);

type SelectedLocationState = {
  selectedLocationId: string | null;
  setSelectedLocation: (locationId: string) => void;
};

let initialLocationId: string | null = null;
export async function loadInitialBookmarkLocation() {
  initialLocationId = await bookmarkLocationStorage.getValue();
}
export function useLocation(locations: readonly BookmarkLocation[]): SelectedLocationState {
  const [storedLocationId, setStoredLocationId] = useState<string | null>(initialLocationId);
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
