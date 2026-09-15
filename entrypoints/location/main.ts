import { fetchCoordinates } from "~shared/lib/geolocation";

import { browser } from "#imports";

// This document exists only for an explicit GPS request; it never watches location.
browser.runtime.onMessage.addListener((message, sender) => {
  if (sender.id !== browser.runtime.id || message?.type !== "min:location:read") return;
  return fetchCoordinates().catch((error: GeolocationPositionError) => ({
    code: error.code,
    message: error.message,
  }));
});
