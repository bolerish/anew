import { z } from "zod";
import { notifyError } from "~shared/lib/notify-error";
import { validateStorage } from "~shared/lib/validated-storage";

import { storage } from "#imports";

const collapsedFoldersSchema = z.record(z.string(), z.boolean().catch(false)).catch({});
export const collapsedFoldersStorage = validateStorage(
  storage.defineItem<Record<string, boolean>>("local:newtab:collapsed-folders:v1", {
    fallback: {},
  }),
  collapsedFoldersSchema,
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
