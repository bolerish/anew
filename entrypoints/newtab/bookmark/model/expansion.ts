import { notifyError } from "~shared/lib/notify-error";

import { storage } from "#imports";

export const collapsedFoldersStorage = storage.defineItem<Record<string, boolean>>(
  "local:newtab:collapsed-folders:v1",
  {
    fallback: {},
  },
);
let initialCollapsedFolders: Record<string, boolean> = {};

export async function loadInitialCollapsedFolders() {
  initialCollapsedFolders = (await collapsedFoldersStorage.getValue()) ?? {};
}

export function getInitialCollapsedFolders() {
  return initialCollapsedFolders;
}

/** Save viewing state independently of the bookmark edit session. */
export async function setFolderExpanded(id: string, expanded: boolean) {
  try {
    await navigator.locks.request("min:collapsed-folders", async () => {
      const current = { ...(await collapsedFoldersStorage.getValue()) };
      if (expanded) delete current[id];
      else current[id] = true;
      await collapsedFoldersStorage.setValue(current);
    });
  } catch (error) {
    await notifyError(error);
  }
}
