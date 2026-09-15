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
  browser.runtime.onMessage.addListener((message, sender) => {
    if (sender.id !== browser.runtime.id) return;
    if (message?.type === "min:update:claim") {
      const result = announcementQueue.then(claimUpdateAnnouncement);
      announcementQueue = result.catch(console.error);
      return result;
    }
  });

  if (import.meta.env.DEV) {
    void seedDevBookmarks();
  }
});
