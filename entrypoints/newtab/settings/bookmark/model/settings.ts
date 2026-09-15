import { notifyError } from "~shared/lib/notify-error";

import { storage } from "#imports";

import { getEditSession, stageBookmarkSettings } from "../../../bookmark/model/edit-session";
import { compactLayout } from "../lib/layout";
export const MAX_FOLDER_HEIGHT_REM = 200;

export type FolderDisplay = {
  icon: "original" | "square" | "dash" | "none";
  showTitle: boolean;
  showUrl?: boolean;
  minHeight?: number;
};
export type FolderView = "list" | "icons";
export type ColumnLayout = { columns: string[][]; widths: number[]; rows?: number[] };
export type BookmarkSettings = {
  folderDisplays?: Record<string, FolderDisplay>;
  folderViews: Record<string, FolderView>;
  layouts: Record<string, ColumnLayout>;
  defaultView: FolderView;
  initialColumns: 1 | 2;
};
export const defaults: BookmarkSettings = { folderViews: {}, layouts: {}, defaultView: "list", initialColumns: 1 };
export const bookmarkSettingsStorage = storage.defineItem<BookmarkSettings>("local:newtab:settings:bookmarks:v1", {
  fallback: defaults,
});
let initialSettings = defaults;
export async function loadInitialBookmarkSettings() {
  initialSettings = sanitizeBookmarkSettings(await bookmarkSettingsStorage.getValue());
}
export function getInitialBookmarkSettings() {
  return initialSettings;
}
export function sanitizeBookmarkSettings(value: unknown): BookmarkSettings {
  const input = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const folderViews: Record<string, FolderView> = {};
  if (input.folderViews && typeof input.folderViews === "object") {
    for (const [id, view] of Object.entries(input.folderViews)) {
      if (view === "list" || view === "icons") folderViews[id] = view;
    }
  }
  const layouts = sanitizeLayouts(input.layouts);
  const folderDisplays = sanitizeFolderDisplays(input.folderDisplays);
  return {
    ...(Object.keys(folderDisplays).length ? { folderDisplays } : {}),
    folderViews,
    layouts,
    defaultView: input.defaultView === "icons" || input.view === "icons" ? "icons" : "list",
    initialColumns: input.initialColumns === 2 || input.columns === 2 ? 2 : 1,
  };
}
function sanitizeLayouts(value: unknown): BookmarkSettings["layouts"] {
  if (!value || typeof value !== "object") return {};
  const layouts: Record<string, ColumnLayout> = {};
  for (const [id, layout] of Object.entries(value ?? {})) {
    if (!layout || !Array.isArray(layout.columns)) continue;
    const columns: string[][] = [];
    const widths: number[] = [];
    const rows: number[] = [];
    for (const [index, column] of layout.columns.entries()) {
      if (!Array.isArray(column)) continue;
      columns.push(column.filter((id): id is string => typeof id === "string"));
      const width = layout.widths?.[index];
      const row = layout.rows?.[index];
      widths.push(Number.isFinite(width) && width > 0 ? width : 1);
      rows.push(Number.isSafeInteger(row) && row >= 0 ? row : 0);
    }
    if (columns.length) layouts[id] = compactLayout(columns, widths, rows);
  }
  return layouts;
}

function sanitizeFolderDisplays(value: unknown): Record<string, FolderDisplay> {
  if (!value || typeof value !== "object") return {};
  const folderDisplays: Record<string, FolderDisplay> = {};
  for (const [id, display] of Object.entries(value ?? {})) {
    if (!display || !["original", "square", "dash", "none"].includes(display.icon)) continue;
    const sanitized: FolderDisplay = {
      icon: display.icon,
      showTitle: display.icon !== "original" || display.showTitle !== false,
    };
    if (display.showUrl === true) sanitized.showUrl = true;
    const height = display.minHeight;
    if (typeof height === "number" && Number.isFinite(height) && height > 0) {
      sanitized.minHeight = Math.min(height, MAX_FOLDER_HEIGHT_REM);
    }
    folderDisplays[id] = sanitized;
  }
  return folderDisplays;
}

export async function setFolderView(id: string, view: FolderView) {
  try {
    const current = sanitizeBookmarkSettings(
      getEditSession().draft?.settings ?? (await bookmarkSettingsStorage.getValue()),
    );
    const next = { ...current, folderViews: { ...current.folderViews, [id]: view } };
    if (!stageBookmarkSettings(next)) await bookmarkSettingsStorage.setValue(next);
  } catch (error) {
    await notifyError(error);
  }
}
export async function setFolderDisplay(id: string, display: FolderDisplay) {
  try {
    const current = sanitizeBookmarkSettings(
      getEditSession().draft?.settings ?? (await bookmarkSettingsStorage.getValue()),
    );
    const next = sanitizeBookmarkSettings({ ...current, folderDisplays: { ...current.folderDisplays, [id]: display } });
    if (!stageBookmarkSettings(next)) await bookmarkSettingsStorage.setValue(next);
  } catch (error) {
    await notifyError(error);
  }
}
export async function saveColumnLayout(id: string, layout: ColumnLayout) {
  try {
    const current = sanitizeBookmarkSettings(
      getEditSession().draft?.settings ?? (await bookmarkSettingsStorage.getValue()),
    );
    const next = { ...current, layouts: { ...current.layouts, [id]: layout } };
    if (!stageBookmarkSettings(next)) await bookmarkSettingsStorage.setValue(next);
  } catch (error) {
    await notifyError(error);
  }
}
