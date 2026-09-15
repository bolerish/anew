import { test, vi } from "vitest";
import { browser, type Browser } from "wxt/browser";

import type { BookmarkSettings } from "../../settings/bookmark/model/settings";
import * as session from "./edit-session";
import type { BookmarkTreeNode } from "./types";

import assert from "node:assert/strict";
test("deferred edits, undo/redo, retry after partial save and external conflict", async () => {
  let tree: BookmarkTreeNode[] = [
    {
      id: "0",
      title: "",
      children: [
        {
          id: "1",
          parentId: "0",
          title: "Bar",
          children: [{ id: "a", parentId: "1", title: "Original", url: "https://example.com" }],
        },
      ],
    },
  ];
  const calls: string[] = [];
  let failUpdate = false;
  const children = () => tree[0].children![0].children!;
  const bookmarks = {
    getTree: async () => structuredClone(tree),
    create: async (input: Browser.bookmarks.CreateDetails) => {
      calls.push("create");
      const node = { ...input, title: input.title ?? "", id: `real-${calls.length}` };
      children().push(node);
      return node;
    },
    update: async (id: string, input: Browser.bookmarks.UpdateChanges) => {
      if (failUpdate) throw new Error("offline");
      calls.push("update");
      Object.assign(children().find((node) => node.id === id)!, input);
    },
    remove: async (id: string) => {
      calls.push("remove");
      tree[0].children![0].children = children().filter((node) => node.id !== id);
    },
  };
  vi.spyOn(browser.bookmarks, "getTree").mockImplementation(async () => structuredClone(tree));
  vi.spyOn(browser.bookmarks, "create").mockImplementation(bookmarks.create);
  vi.spyOn(browser.bookmarks, "update").mockImplementation(async (id, input) => {
    await bookmarks.update(id, input);
    return children().find((node) => node.id === id)!;
  });
  vi.spyOn(browser.bookmarks, "remove").mockImplementation(bookmarks.remove);
  const settings: BookmarkSettings = { folderViews: {}, layouts: {}, defaultView: "list", initialColumns: 1 };
  await session.beginEditing(settings);
  await session.performBookmarkCommand({ type: "update", id: "a", input: { title: "Draft" } });
  assert.equal(children()[0].title, "Original");
  assert.equal(session.getEditSession().draft!.tree[0].children![0].children![0].title, "Draft");
  session.undoEditing();
  assert.equal(session.getEditSession().draft!.tree[0].children![0].children![0].title, "Original");
  session.redoEditing();
  assert.equal(session.getEditSession().draft!.tree[0].children![0].children![0].title, "Draft");
  session.stageBookmarkSettings({ ...settings, folderViews: { a: "icons" } });
  session.cancelEditing();
  assert.equal(calls.length, 0);
  assert.equal(children()[0].title, "Original");
  await session.beginEditing(settings);
  await session.performBookmarkCommand({
    type: "create",
    id: "temp",
    input: { parentId: "1", title: "New", url: "https://example.org" },
  });
  await session.performBookmarkCommand({ type: "update", id: "temp", input: { title: "Renamed" } });
  session.stageBookmarkSettings({ ...settings, folderViews: { temp: "icons" } });
  failUpdate = true;
  await assert.rejects(
    session.saveEditing(async () => {}),
    /offline/,
  );
  assert.equal(session.getEditSession().failed, true);
  session.cancelEditing();
  assert.equal(session.getEditSession().active, true, "Partial saves cannot be silently discarded");
  failUpdate = false;
  let saved: BookmarkSettings | undefined;
  await session.saveEditing(async (value) => {
    saved = value;
  });
  assert.equal(calls.filter((call) => call === "create").length, 1, "Retry must not create duplicates");
  assert.equal(children()[1].title, "Renamed");
  assert.equal(saved!.folderViews[children()[1].id], "icons");
  await session.beginEditing(settings);
  await session.performBookmarkCommand({ type: "remove", id: "a", folder: false });
  children()[0].title = "External change";
  await assert.rejects(
    session.saveEditing(async () => {}),
    /outside/,
  );
  assert.equal(children()[0].title, "External change");
  session.cancelEditing();

  await session.performBookmarkCommand({ type: "update", id: "a", input: { title: "Normal mode" } });
  assert.equal(children()[0].title, "Normal mode", "Normal-mode changes apply immediately");
  assert.equal(session.getEditSession().active, false);
});
