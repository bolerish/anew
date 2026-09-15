import { expect, test, vi } from "vitest";

import {
  collapsedFoldersStorage,
  getInitialCollapsedFolders,
  loadInitialCollapsedFolders,
  setFolderExpanded,
} from "./expansion";

test("restores collapsed folders before rendering and preserves other folders when reopening", async () => {
  vi.stubGlobal("navigator", {
    locks: { request: async (_name: string, action: () => Promise<void>) => action() },
  });
  await setFolderExpanded("a", false);
  await setFolderExpanded("b", false);
  await loadInitialCollapsedFolders();
  expect(getInitialCollapsedFolders()).toEqual({ a: true, b: true });
  await setFolderExpanded("a", true);
  await loadInitialCollapsedFolders();
  expect(getInitialCollapsedFolders()).toEqual({ b: true });
  expect(await collapsedFoldersStorage.getValue()).toEqual({ b: true });
});
