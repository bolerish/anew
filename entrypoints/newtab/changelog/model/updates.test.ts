import { expect, test, vi } from "vitest";

import { browser } from "#imports";

import { scheduleUpdateAnnouncement, claimUpdateAnnouncement } from "../../../background/update-announcement";

test("first installation stays quiet", async () => {
  await scheduleUpdateAnnouncement("install");
  expect(await claimUpdateAnnouncement()).toBeNull();
});
test("a version update is announced only once", async () => {
  vi.spyOn(browser.runtime, "getManifest").mockReturnValue({ version: "1.2.0", manifest_version: 3, name: "Min" });
  await scheduleUpdateAnnouncement("update", "1.1.3");
  expect(await claimUpdateAnnouncement()).toBe("1.2.0");
  expect(await claimUpdateAnnouncement()).toBeNull();
  await scheduleUpdateAnnouncement("update", "1.2.0");
  expect(await claimUpdateAnnouncement()).toBeNull();
});
