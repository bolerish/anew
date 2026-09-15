import { performBookmarkCommand } from "../model/edit-session";
import { isRootBookmarkFolder, type BookmarkFolder, type BookmarkItem } from "../model/types";

type MoveTarget = {
  index?: number;
  parentId: string;
};

export async function moveItem(item: BookmarkItem, target: MoveTarget): Promise<void> {
  await performBookmarkCommand({ type: "move", id: item.id, input: target });
}

export async function moveFolder(folder: BookmarkFolder, target: MoveTarget): Promise<void> {
  if (isRootBookmarkFolder(folder)) {
    return;
  }

  await performBookmarkCommand({ type: "move", id: folder.id, input: target });
}
