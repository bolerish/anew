import { expect, test } from "vitest";

import { canNormalizeUrl, normalizeUrl } from "./url";

test("normalizes bare hosts while preserving explicit supported schemes", () => {
  expect(normalizeUrl("example.com:8443/path")).toBe("https://example.com:8443/path");
  expect(normalizeUrl(" example.com/path ")).toBe("https://example.com/path");
  for (const url of [
    "ftp://example.com/file",
    "file:///tmp/bookmark.html",
    "mailto:me@example.com",
    "chrome://bookmarks",
    "about:blank",
  ]) {
    expect(normalizeUrl(url)).toBe(new URL(url).toString());
  }
  expect(canNormalizeUrl("javascript:alert(1)")).toBe(false);
  expect(canNormalizeUrl("")).toBe(false);
  expect(canNormalizeUrl("unsupported:example")).toBe(false);
});
