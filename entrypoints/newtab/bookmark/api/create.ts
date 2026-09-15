import { browser } from "wxt/browser";
import { z } from "zod";

import { resolveBookmarkNode } from "../lib/tree";
import { bookmarkUrlSchema } from "../lib/url";
import { getEditSession, performBookmarkCommand } from "../model/edit-session";

export const createItemSchema = z.object({
  parentId: z.string().min(1),
  title: z.string(),
  url: bookmarkUrlSchema,
});
export const createFolderSchema = z.object({
  index: z.number().int().nonnegative().optional(),
  parentId: z.string().min(1),
  title: z.string().trim().min(1),
});

export async function createItem(rawInput: z.input<typeof createItemSchema>): Promise<"created" | "duplicate"> {
  const input = createItemSchema.parse(rawInput);
  const normalizedUrl = input.url;
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

export async function createFolder(input: z.input<typeof createFolderSchema>): Promise<void> {
  await performBookmarkCommand({ type: "create", id: crypto.randomUUID(), input: createFolderSchema.parse(input) });
}
