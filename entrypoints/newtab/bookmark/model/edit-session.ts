import { useSyncExternalStore } from "react";
import { browser } from "wxt/browser";
import { withMinWriteLock } from "~shared/lib/write-lock";

import type { BookmarkSettings } from "../../settings/bookmark/model/settings";
import type { BookmarkTreeNode } from "./types";

type Command =
  | { type: "create"; id: string; input: { parentId?: string; index?: number; title: string; url?: string } }
  | { type: "update"; id: string; input: { title: string; url?: string } }
  | { type: "move"; id: string; input: { parentId: string; index?: number } }
  | { type: "remove"; id: string; folder: boolean };
type Draft = { tree: BookmarkTreeNode[]; settings: BookmarkSettings; commands: Command[] };
const listeners = new Set<() => void>();
let history: Draft[] = [];
let cursor = -1;
let baseline = "";
let completed = 0;
const createdIds = new Map<string, string>();
let state = { active: false, busy: false, failed: false, canUndo: false, canRedo: false, draft: null as Draft | null };
export const getEditSession = () => state;
export function subscribeEditSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function useEditSession() {
  return useSyncExternalStore(subscribeEditSession, getEditSession);
}
function publish() {
  const canNavigateHistory = !state.busy && !state.failed;
  state = {
    ...state,
    draft: history[cursor] ?? null,
    canUndo: cursor > 0 && canNavigateHistory,
    canRedo: cursor < history.length - 1 && canNavigateHistory,
  };
  for (const listener of listeners) listener();
}
function fingerprint(tree: readonly BookmarkTreeNode[]): string {
  // Compare bookmark content/order only; browser timestamps and metadata are irrelevant.
  return JSON.stringify(tree, ["id", "parentId", "title", "url", "children"]);
}
export async function beginEditing(settings: BookmarkSettings) {
  if (state.active || state.busy) return;
  state = { ...state, busy: true };
  publish();
  try {
    const tree = await browser.bookmarks.getTree();
    baseline = fingerprint(tree);
    history = [{ tree, settings: structuredClone(settings), commands: [] }];
    cursor = 0;
    completed = 0;
    createdIds.clear();
    state = { ...state, active: true, failed: false };
  } finally {
    state = { ...state, busy: false };
    publish();
  }
}
function push(draft: Draft) {
  history = [...history.slice(0, cursor + 1), draft];
  cursor++;
  publish();
}
export function undoEditing() {
  if (state.canUndo) {
    cursor--;
    publish();
  }
}
export function redoEditing() {
  if (state.canRedo) {
    cursor++;
    publish();
  }
}
export function cancelEditing() {
  if (state.busy || state.failed) return;
  history = [];
  cursor = -1;
  state = { ...state, active: false };
  publish();
}
export function stageBookmarkSettings(settings: BookmarkSettings): boolean {
  if (!state.active) return false;
  if (state.busy || state.failed) throw new Error("Finish saving before editing again.");
  push({ ...history[cursor], settings });
  return true;
}
function find(tree: BookmarkTreeNode[], id: string): BookmarkTreeNode | undefined {
  for (const node of tree) {
    if (node.id === id) return node;
    const child = find(node.children ?? [], id);
    if (child) return child;
  }
}
function reindex(node: BookmarkTreeNode) {
  node.children?.forEach((child, index) => {
    child.index = index;
    child.parentId = node.id;
  });
}
export async function performBookmarkCommand(command: Command) {
  if (!state.active) {
    await withMinWriteLock(() => execute(command));
    return;
  }
  if (state.busy || state.failed) throw new Error("Finish saving before editing again.");
  const draft = structuredClone(history[cursor]);
  const node = find(draft.tree, command.id);
  if (command.type === "create") {
    const parent = find(draft.tree, command.input.parentId ?? "1");
    if (!parent) throw new Error("Bookmark folder no longer exists.");
    parent.children ??= [];
    parent.children.splice(command.input.index ?? parent.children.length, 0, {
      ...command.input,
      id: command.id,
      parentId: parent.id,
      ...(command.input.url ? {} : { children: [] }),
    });
    reindex(parent);
  } else {
    if (!node) throw new Error("Bookmark no longer exists.");
    if (command.type === "update") Object.assign(node, command.input);
    else {
      const parent = find(draft.tree, node.parentId!);
      if (!parent?.children) throw new Error("Bookmark folder no longer exists.");
      const sourceIndex = parent.children.findIndex((child) => child.id === node.id);
      parent.children = parent.children.filter((child) => child.id !== node.id);
      reindex(parent);
      if (command.type === "move") {
        const destination = find(draft.tree, command.input.parentId);
        if (!destination || destination.url || destination.id === node.id) throw new Error("Invalid destination.");
        destination.children ??= [];
        let index = command.input.index ?? destination.children.length;
        if (destination.id === parent.id && command.input.index !== undefined && sourceIndex < index) index--;
        destination.children.splice(index, 0, node);
        reindex(destination);
      }
    }
  }
  draft.commands.push(command);
  push(draft);
}
async function execute(command: Command) {
  const id = createdIds.get(command.id) ?? command.id;
  if (command.type === "create") {
    const input = {
      ...command.input,
      parentId: createdIds.get(command.input.parentId ?? "") ?? command.input.parentId,
    };
    const node = await browser.bookmarks.create(input);
    createdIds.set(command.id, node.id);
  } else if (command.type === "update") await browser.bookmarks.update(id, command.input);
  else if (command.type === "move")
    await browser.bookmarks.move(id, {
      ...command.input,
      parentId: createdIds.get(command.input.parentId) ?? command.input.parentId,
    });
  else if (command.folder) await browser.bookmarks.removeTree(id);
  else await browser.bookmarks.remove(id);
}
export async function saveEditing(saveSettings: (settings: BookmarkSettings, base: BookmarkSettings) => Promise<void>) {
  if (!state.active || state.busy) return;
  state = { ...state, busy: true };
  publish();
  try {
    await withMinWriteLock(async () => {
      if (fingerprint(await browser.bookmarks.getTree()) !== baseline)
        throw new Error("Bookmarks changed outside this editor. Cancel and reopen editing.");
      const draft = history[cursor];
      // Browser bookmark APIs have no transaction: retain progress so a retry cannot duplicate successful operations.
      while (completed < draft.commands.length) {
        // oxlint-disable-next-line no-await-in-loop -- Later commands can reference IDs created by earlier commands.
        await execute(draft.commands[completed]);
        completed++;
        const savedDraft = history.find((entry) => entry.commands.length === completed)!;
        baseline = fingerprint(resolveCreatedNodes(savedDraft.tree));
      }
      const settings = structuredClone(draft.settings);
      for (const [temporary, real] of createdIds) {
        if (settings.folderDisplays?.[temporary]) {
          settings.folderDisplays[real] = settings.folderDisplays[temporary];
          delete settings.folderDisplays[temporary];
        }
        if (settings.folderViews[temporary]) {
          settings.folderViews[real] = settings.folderViews[temporary];
          delete settings.folderViews[temporary];
        }
        for (const layout of Object.values(settings.layouts))
          layout.columns = layout.columns.map((column) => column.map((id) => (id === temporary ? real : id)));
        if (settings.layouts[temporary]) {
          settings.layouts[real] = settings.layouts[temporary];
          delete settings.layouts[temporary];
        }
      }
      await saveSettings(settings, history[0].settings);
    });
    history = [];
    cursor = -1;
    state = { ...state, active: false, failed: false };
  } catch (error) {
    state = { ...state, failed: completed > 0 };
    throw error;
  } finally {
    state = { ...state, busy: false };
    publish();
  }
}

function resolveCreatedNodes(tree: readonly BookmarkTreeNode[]): BookmarkTreeNode[] {
  return tree.map((node) => ({
    ...node,
    id: createdIds.get(node.id) ?? node.id,
    parentId: createdIds.get(node.parentId ?? "") ?? node.parentId,
    ...(node.children ? { children: resolveCreatedNodes(node.children) } : {}),
  }));
}
