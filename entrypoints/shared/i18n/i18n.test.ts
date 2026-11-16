import { expect, test } from "vitest";

import { bookmarkMessages } from "./bookmark";
import { feedbackMessages } from "./feedback";
import { getMessages } from "./index";
import { searchMessages } from "./search";
import { settingsMessages } from "./settings";
import { updatesMessages } from "./updates";
import { weatherMessages } from "./weather";

import { readFileSync } from "node:fs";

test.each([feedbackMessages, bookmarkMessages, searchMessages, settingsMessages, weatherMessages, updatesMessages])(
  "all message catalogs cover the same languages and keys",
  (catalog) => {
    expect(Object.keys(catalog).sort()).toEqual(["en", "es", "ja", "ko", "zh"]);
    for (const messages of Object.values(catalog)) {
      expect(translationShape(messages)).toEqual(translationShape(catalog.ko));
    }
  },
);
test("unsupported languages fall back to English", () => {
  expect(getMessages("fr")).toEqual(getMessages("en"));
});

test("the 1.2.0 changelog matches the in-app English release notes", () => {
  const changelog = readFileSync("CHANGELOG.md", "utf8");
  const release = changelog.split("## Version v1.2.0\n")[1]?.split("## Version v1.1.3")[0];
  expect(release).toContain("Released on 2026-09-15.");
  const items = release?.match(/^- .+(?:\n {2,4}.+)*/gm)?.map((item) => item.slice(2).replace(/\n {2,4}/g, " "));
  expect(items).toEqual(updatesMessages.en.currentSections.flatMap((section) => section.items));
  expect(release?.match(/^### .+$/gm) ?? []).toEqual(
    updatesMessages.en.currentSections.filter((section) => section.title).map((section) => `### ${section.title}`),
  );
});

function translationShape(value: unknown): unknown {
  if (typeof value === "string") return value.trim() ? "translated" : "empty";
  if (Array.isArray(value)) return value.map(translationShape);
  if (!value || typeof value !== "object") return typeof value;
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, translationShape(entry)]));
}
