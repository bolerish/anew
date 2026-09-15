import { browser, storage } from "#imports";

const PENDING_UPDATE_KEY = "local:pending-update-announcement";

/** Installation itself is quiet; only a version change schedules an announcement. */
export async function scheduleUpdateAnnouncement(reason: string, previousVersion?: string) {
  if (reason !== "update") return;
  const version = browser.runtime.getManifest().version;
  if (previousVersion === version) return;
  await storage.setItem(PENDING_UPDATE_KEY, version);
}

/** Called through the background's serial message queue so only one tab claims it. */
export async function claimUpdateAnnouncement(): Promise<string | null> {
  const version = await storage.getItem<string>(PENDING_UPDATE_KEY);
  if (version) await storage.removeItem(PENDING_UPDATE_KEY);
  return version;
}
