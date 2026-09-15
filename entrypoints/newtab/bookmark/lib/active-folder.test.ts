import { expect, test } from "vitest";

import { resolveActiveFolder } from "./active-folder";

const positions = [
  { id: "first", top: 0 },
  { id: "middle", top: 400 },
  { id: "last", top: 650 },
];

test("keeps a clicked bottom folder active when it cannot reach the viewport top", () => {
  expect(resolveActiveFolder(positions, 420, 420, "last")).toBe("last");
});

test("preserves the clicked folder when several folders share the bottom scroll limit", () => {
  expect(resolveActiveFolder(positions, 300, 300, "middle")).toBe("middle");
  expect(resolveActiveFolder(positions, 300, 300, "last")).toBe("last");
});

test("resumes tracking the nearest folder when scrolling up", () => {
  expect(resolveActiveFolder(positions, 100, 420, "last")).toBe("first");
  expect(resolveActiveFolder(positions, 390, 420, "last")).toBe("middle");
});

test("handles non-scrollable content and missing folders", () => {
  expect(resolveActiveFolder(positions, 0, 0, "middle")).toBe("middle");
  expect(resolveActiveFolder([], 0, 0, undefined)).toBeUndefined();
});
