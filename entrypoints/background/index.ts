import { DEV_BOOKMARK_FOLDERS, DEV_BOOKMARK_SEED_KEY } from "./constants";

export default defineBackground(() => {
  if (import.meta.env.DEV) {
    void seedDevBookmarks();
  }
});

async function seedDevBookmarks(): Promise<void> {
  const storage = await browser.storage.local.get(DEV_BOOKMARK_SEED_KEY);

  if (storage[DEV_BOOKMARK_SEED_KEY]) {
    return;
  }

  try {
    const parentId = await getBookmarkBarId();

    await Promise.all(
      DEV_BOOKMARK_FOLDERS.map(async (folder) => {
        const folderNode = await browser.bookmarks.create({
          parentId,
          title: folder.title,
        });

        await Promise.all(
          folder.items.map((item) =>
            browser.bookmarks.create({
              parentId: folderNode.id,
              title: item.title,
              url: item.url,
            }),
          ),
        );
      }),
    );

    await browser.storage.local.set({ [DEV_BOOKMARK_SEED_KEY]: true });
    console.info("[newtab:dev] seeded bookmark fixtures");
  } catch (error) {
    console.error("[newtab:dev] failed to seed bookmark fixtures", error);
  }
}

async function getBookmarkBarId(): Promise<string> {
  const [root] = await browser.bookmarks.getTree();
  const bookmarkBar = root.children?.find((child) => child.parentId === root.id);

  if (!bookmarkBar) {
    throw new Error("Bookmark bar folder was not found.");
  }

  return bookmarkBar.id;
}
