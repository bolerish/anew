import { z } from "zod";
import { notifyError } from "~shared/lib/notify-error";
import { validateStorage } from "~shared/lib/validated-storage";
import { updateStoredValue } from "~shared/lib/write-lock";

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
    await updateStoredValue(collapsedFoldersStorage, (stored) => {
      const current = { ...stored };
      if (expanded) delete current[id];
      else current[id] = true;
      return current;
    });
  } catch (error) {
    await notifyError(error);
  }
}
