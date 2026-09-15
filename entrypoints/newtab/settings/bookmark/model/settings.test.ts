import { test } from "vitest";

import * as dnd from "../../../bookmark/lib/dnd";
import * as layoutModel from "../lib/layout";
import * as settings from "./settings";

import assert from "node:assert/strict";
test("layout migration, row moves and independent folder settings", async () => {
  const invalid = settings.sanitizeBookmarkSettings(
    JSON.parse('{ "columns": 10, "view": "unknown", "startFolderId": 4 }'),
  );
  assert.equal(invalid.initialColumns, 1);
  assert.equal(invalid.defaultView, "list");
  assert.equal("startFolderId" in invalid, false);
  assert.equal(settings.sanitizeBookmarkSettings({ columns: 2, view: "icons" }).defaultView, "icons");
  const initial = layoutModel.resolveColumnLayout(["a", "b", "c"]);
  assert.deepEqual(initial, { columns: [["a", "b", "c"]], widths: [1] });
  const moved = layoutModel.moveLayoutFolder(initial, "b", 1);
  assert.deepEqual(moved.columns, [["a", "c"], ["b"]]);
  assert.deepEqual(layoutModel.moveLayoutFolder(moved, "a", 1, "b").columns, [["c"], ["a", "b"]]);
  assert.deepEqual(layoutModel.moveLayoutFolder(moved, "b", 0, "a").columns, [["b", "a", "c"]]);
  assert.deepEqual(layoutModel.resolveColumnLayout(["a", "c", "d"], moved), {
    columns: [["a", "c", "d"]],
    widths: [1],
  });
  await settings.saveColumnLayout("root", { ...moved, widths: [2, 1] });
  await settings.setFolderView("a", "icons");
  await settings.setFolderView("b", "list");
  assert.deepEqual((await settings.bookmarkSettingsStorage.getValue()).layouts.root.widths, [2, 1]);
  assert.deepEqual((await settings.bookmarkSettingsStorage.getValue()).folderViews, { a: "icons", b: "list" });

  // Grid insertion follows the horizontal pointer position; lists keep vertical insertion.
  const tile = { getBoundingClientRect: () => ({ left: 100, top: 20, width: 84, height: 50 }) } as HTMLElement;
  assert.equal(dnd.resolveHorizontalEdge(141, tile), "before");
  assert.equal(dnd.resolveHorizontalEdge(142, tile), "after");
  assert.equal(dnd.resolveVerticalEdge(44, tile), "before");
  assert.equal(dnd.resolveVerticalEdge(45, tile), "after");

  // Rows preserve existing column data and allow full-width sections below a split row.
  const split = { columns: [["a", "c"], ["b"]], widths: [2, 1] };
  const below = layoutModel.moveLayoutFolderToRow(split, "c", 1);
  assert.deepEqual(below, { columns: [["a"], ["b"], ["c"]], widths: [2, 1, 1], rows: [0, 0, 1] });
  await settings.saveColumnLayout("rows", below);
  const restored = settings.sanitizeBookmarkSettings(await settings.bookmarkSettingsStorage.getValue()).layouts.rows;
  assert.deepEqual(layoutModel.resolveColumnLayout(["a", "b", "c"], restored), below);
  const recombined = layoutModel.moveLayoutFolder(below, "c", 0);
  assert.deepEqual(recombined, { columns: [["a", "c"], ["b"]], widths: [2, 1] });
  const secondSplit = layoutModel.moveLayoutFolder(below, "b", 3, undefined, 1);
  assert.deepEqual(secondSplit, { columns: [["a"], ["c"], ["b"]], widths: [2, 1, 1], rows: [0, 1, 1] });
  const middle = layoutModel.moveLayoutFolderToRow(below, "b", 1);
  assert.deepEqual(middle, { columns: [["a"], ["b"], ["c"]], widths: [2, 1, 1], rows: [0, 1, 2] });
  assert.deepEqual(layoutModel.resolveColumnLayout(["c"], below), { columns: [["c"]], widths: [1] });
  assert.deepEqual(layoutModel.resolveColumnLayout(["a"], { columns: [], widths: [] }), {
    columns: [["a"]],
    widths: [1],
  });

  await settings.setFolderDisplay("a", { icon: "original", showTitle: false });
  await settings.setFolderDisplay("b", { icon: "dash", showTitle: false });
  assert.deepEqual((await settings.bookmarkSettingsStorage.getValue()).folderDisplays!.a, {
    icon: "original",
    showTitle: false,
  });
  assert.deepEqual((await settings.bookmarkSettingsStorage.getValue()).folderDisplays!.b, {
    icon: "dash",
    showTitle: true,
  });
  assert.equal(
    settings.sanitizeBookmarkSettings(JSON.parse('{ "folderDisplays": { "bad": { "icon": "invalid" } } }'))
      .folderDisplays,
    undefined,
  );

  await settings.setFolderDisplay("url-folder", { icon: "original", showTitle: true, showUrl: true });
  assert.equal((await settings.bookmarkSettingsStorage.getValue()).folderDisplays!["url-folder"].showUrl, true);
  await settings.setFolderDisplay("url-folder", { icon: "original", showTitle: true, showUrl: false });
  assert.equal((await settings.bookmarkSettingsStorage.getValue()).folderDisplays!["url-folder"].showUrl, undefined);

  const heightSettings = settings.sanitizeBookmarkSettings({
    folderDisplays: {
      a: { icon: "original", showTitle: true, minHeight: 24 },
      b: { icon: "original", showTitle: true, minHeight: -1 },
      c: { icon: "original", showTitle: true, minHeight: Infinity },
      d: { icon: "original", showTitle: true, minHeight: 999 },
    },
  });
  assert.equal(heightSettings.folderDisplays!.a.minHeight, 24);
  assert.equal(heightSettings.folderDisplays!.b.minHeight, undefined);
  assert.equal(heightSettings.folderDisplays!.c.minHeight, undefined);
  assert.equal(heightSettings.folderDisplays!.d.minHeight, 200);

  const splitOnlyTop = layoutModel.moveLayoutFolderBeside(
    { columns: [["work", "development", "dev", "install"]], widths: [1] },
    "install",
    "work",
  );
  assert.deepEqual(splitOnlyTop, {
    columns: [["work"], ["install"], ["development", "dev"]],
    widths: [1, 1, 1],
    rows: [0, 0, 1],
  });
  const splitBelow = layoutModel.moveLayoutFolderBeside(splitOnlyTop, "dev", "development");
  assert.deepEqual(splitBelow, {
    columns: [["work"], ["install"], ["development"], ["dev"]],
    widths: [1, 1, 1, 1],
    rows: [0, 0, 1, 1],
  });
  const fullBelow = layoutModel.moveLayoutFolderToRow(splitBelow, "dev", 2);
  assert.deepEqual(fullBelow.rows, [0, 0, 1, 2]);

  const existingColumn = layoutModel.moveLayoutFolder(
    { columns: [["work", "development", "dev", "install"], ["other"]], widths: [1, 1] },
    "install",
    1,
    "other",
    undefined,
    true,
  );
  assert.deepEqual(existingColumn, {
    columns: [["work"], ["install"], ["development", "dev"], ["other"]],
    widths: [1, 1, 1, 1],
    rows: [0, 0, 1, 1],
  });
  const emptyNeighbor = layoutModel.moveLayoutFolder(
    { columns: [["work", "development", "dev", "install"], []], widths: [1, 1] },
    "install",
    1,
    undefined,
    undefined,
    true,
  );
  assert.deepEqual(emptyNeighbor, {
    columns: [["work"], ["install"], ["development", "dev"]],
    widths: [1, 1, 1],
    rows: [0, 0, 1],
  });
});

test("invalid persisted bookmark settings fall back safely", () => {
  assert.deepEqual(settings.sanitizeBookmarkSettings(null), settings.defaults);
  assert.deepEqual(settings.sanitizeBookmarkSettings({ layouts: 1, folderDisplays: false }), settings.defaults);
});

test("invalid columns do not shift neighboring width and row metadata", () => {
  const value = settings.sanitizeBookmarkSettings({
    layouts: { root: { columns: [null, ["a"], ["b"]], widths: [9, 2, 3], rows: [0, 1, 2] } },
  });
  assert.deepEqual(value.layouts.root, { columns: [["a"], ["b"]], widths: [2, 3], rows: [0, 1] });
});

test("drag payloads reject incomplete bookmark objects", () => {
  assert.equal(dnd.isDragData({ kind: "item", item: {} }), false);
  assert.equal(dnd.isDragData({ kind: "folder", folder: {} }), false);
  const item = { id: "1", parentId: "0", title: "Site", url: "https://example.com" };
  assert.equal(dnd.isDragData({ kind: "item", item }), true);
  assert.equal(dnd.isDropData({ kind: "item", item, edge: "sideways" }), false);
});

test("legacy square folder markers migrate without losing display settings", () => {
  for (const icon of ["square", "dot"]) {
    const result = settings.sanitizeBookmarkSettings({
      folderDisplays: { folder: { icon, showTitle: true, showUrl: true, minHeight: 24 } },
    });
    assert.deepEqual(result.folderDisplays?.folder, {
      icon: "dot",
      showTitle: true,
      showUrl: true,
      minHeight: 24,
    });
  }
});
