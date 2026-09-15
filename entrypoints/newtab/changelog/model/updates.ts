import { useStorageValue } from "~shared/hooks/useStorageValue";

import { storage } from "#imports";

export const LATEST_UPDATE_VERSION = "1.2.0";
export const lastReadUpdateStorage = storage.defineItem<string | null>("local:newtab:last-read-update", {
  fallback: "",
});

export function useUnreadUpdates() {
  const lastRead = useStorageValue(lastReadUpdateStorage, () => null);
  return lastRead !== null && lastRead !== LATEST_UPDATE_VERSION;
}

export async function markUpdatesRead() {
  await lastReadUpdateStorage.setValue(LATEST_UPDATE_VERSION);
}
