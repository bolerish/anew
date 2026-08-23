import { seedDevBookmarks } from "./seed-dev-bookmarks";

export default defineBackground(() => {
  if (import.meta.env.DEV) {
    void seedDevBookmarks();
  }
});
