import { browser } from "#imports";

import { seedDevBookmarks } from "./seed-dev-bookmarks";
import { scheduleUpdateAnnouncement, claimUpdateAnnouncement } from "./update-announcement";

export default defineBackground(() => {
  let announcementQueue: Promise<unknown> = Promise.resolve();
  browser.runtime.onInstalled.addListener(({ reason, previousVersion }) => {
    announcementQueue = announcementQueue
      .then(() => scheduleUpdateAnnouncement(reason, previousVersion))
      .catch(console.error);
  });
  let locationRequest: Promise<unknown> | null = null;
  browser.runtime.onMessage.addListener((message, sender) => {
    if (sender.id !== browser.runtime.id) return;
    if (message?.type === "min:update:claim") {
      const result = announcementQueue.then(claimUpdateAnnouncement);
      announcementQueue = result.catch(console.error);
      return result;
    }
    if (message?.type !== "min:location") return;
    locationRequest ??= requestLocation().finally(() => {
      locationRequest = null;
    });
    return locationRequest;
  });

  async function requestLocation() {
    try {
      if (!(await browser.offscreen.hasDocument())) {
        await browser.offscreen.createDocument({
          url: "location.html",
          reasons: ["GEOLOCATION"],
          justification: "Read location once when the user presses the weather GPS button.",
        });
      }
      return await browser.runtime.sendMessage({ type: "min:location:read" });
    } finally {
      if (await browser.offscreen.hasDocument()) await browser.offscreen.closeDocument();
    }
  }

  if (import.meta.env.DEV) {
    void seedDevBookmarks();
  }
});
