import { browser } from "wxt/browser";

import { resolveBookmarkNode } from "../lib/tree";
import { normalizeUrl } from "../lib/url";
import { getEditSession, performBookmarkCommand } from "../model/edit-session";

export async function createItem(input: {
  parentId: string;
  title: string;
  url: string;
}): Promise<"created" | "duplicate"> {
  const normalizedUrl = normalizeUrl(input.url);
  const session = getEditSession();
  const children =
    session.active && session.draft
      ? (resolveBookmarkNode(session.draft.tree, input.parentId)?.children ?? [])
      : await browser.bookmarks.getChildren(input.parentId);
  const isDuplicate = children.some((bookmark) => {
    if (!bookmark.url) return false;
    try {
      return new URL(bookmark.url).toString() === normalizedUrl;
    } catch {
      return false;
    }
  });
  if (isDuplicate) return "duplicate";

  await performBookmarkCommand({
    type: "create",
    id: crypto.randomUUID(),
    input: {
      parentId: input.parentId,
      title: input.title,
      url: normalizedUrl,
    },
  });
  return "created";
}

export async function createFolder(input: { index?: number; parentId: string; title: string }): Promise<void> {
  await performBookmarkCommand({ type: "create", id: crypto.randomUUID(), input });
}
