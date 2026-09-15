import { expect, test, vi } from "vitest";
import { browser } from "wxt/browser";

import { getEditSession, performBookmarkCommand } from "../model/edit-session";
import { createItem } from "./create";

vi.mock("../model/edit-session", () => ({
  getEditSession: vi.fn<typeof getEditSession>(),
  performBookmarkCommand: vi.fn<typeof performBookmarkCommand>(async () => {}),
}));

test("rejects the same address only in the destination folder", async () => {
  vi.mocked(getEditSession).mockReturnValue({ active: false } as ReturnType<typeof getEditSession>);
  vi.spyOn(browser.bookmarks, "getChildren").mockImplementation(async (id) =>
    id === "one" ? [{ id: "saved", title: "Saved", url: "https://example.com" }] : [],
  );
  vi.mocked(performBookmarkCommand).mockClear();
  expect(await createItem({ parentId: "one", title: "Other title", url: "example.com/" })).toBe("duplicate");
  expect(performBookmarkCommand).not.toHaveBeenCalled();
  expect(await createItem({ parentId: "two", title: "Example", url: "https://example.com" })).toBe("created");
  expect(await createItem({ parentId: "one", title: "Other page", url: "https://example.com/page" })).toBe("created");
  expect(performBookmarkCommand).toHaveBeenCalledTimes(2);
});

test("checks the draft instead of saved bookmarks during editing", async () => {
  vi.mocked(getEditSession).mockReturnValue({
    active: true,
    draft: {
      tree: [
        {
          id: "draft-folder",
          title: "Draft",
          children: [{ id: "draft-item", title: "Draft", url: "https://example.com/" }],
        },
      ],
    },
  } as ReturnType<typeof getEditSession>);
  const read = vi.spyOn(browser.bookmarks, "getChildren");
  vi.mocked(performBookmarkCommand).mockClear();
  expect(await createItem({ parentId: "draft-folder", title: "Example", url: "example.com" })).toBe("duplicate");
  expect(read).not.toHaveBeenCalled();
  expect(performBookmarkCommand).not.toHaveBeenCalled();
});
