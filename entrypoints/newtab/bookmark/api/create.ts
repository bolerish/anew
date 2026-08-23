import { browser } from "wxt/browser";

import { normalizeUrl } from "../lib/url";

export async function createItem(input: { parentId?: string; title: string; url: string }): Promise<void> {
  const normalizedUrl = normalizeUrl(input.url);

  await browser.bookmarks.create({
    parentId: input.parentId,
    title: input.title,
    url: normalizedUrl,
  });
}
