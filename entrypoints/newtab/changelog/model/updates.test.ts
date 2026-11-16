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

test("the newest release matches the package version in every language", async () => {
  const { getUpdateEntries } = await import("./updates");
  const { default: metadata } = await import("../../../../package.json");
  for (const language of ["ko", "en", "ja", "es", "zh"] as const) {
    const entries = getUpdateEntries(language);
    expect(entries[0].version).toBe(metadata.version);
    expect(entries[0].sections[0].items).toHaveLength(2);
    expect(entries[1].version).toBe("1.2.0");
  }
});
