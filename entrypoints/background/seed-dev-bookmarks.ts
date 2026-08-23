import { DEV_BOOKMARK_FIXTURES, type BookmarkFixture } from "./bookmark-fixtures";

const DEV_BOOKMARK_SEED_KEY = "newtab:dev-bookmark-seed:v1";

export async function seedDevBookmarks(): Promise<void> {
  const seedState = await browser.storage.local.get(DEV_BOOKMARK_SEED_KEY);

  if (seedState[DEV_BOOKMARK_SEED_KEY]) {
    return;
  }

  try {
    const bookmarkBarId = await getBookmarkBarId();

    await Promise.all(DEV_BOOKMARK_FIXTURES.map((fixture) => createBookmarks(fixture, bookmarkBarId)));

    await browser.storage.local.set({ [DEV_BOOKMARK_SEED_KEY]: true });
    console.info("[newtab:dev] seeded bookmark fixtures");
  } catch (error) {
    console.error("[newtab:dev] failed to seed bookmark fixtures", error);
  }
}

async function createBookmarks(fixture: BookmarkFixture, parentId: string): Promise<void> {
  const node = await browser.bookmarks.create({ parentId, title: fixture.title, url: fixture.url });

  await Promise.all((fixture.children ?? []).map((child) => createBookmarks(child, node.id)));
}

async function getBookmarkBarId(): Promise<string> {
  const [root] = await browser.bookmarks.getTree();
  const bookmarkBar = root.children?.find((child) => child.folderType === "bookmarks-bar");

  if (!bookmarkBar) {
    throw new Error("Bookmark bar folder was not found.");
  }

  return bookmarkBar.id;
}
