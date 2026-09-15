import { z } from "zod";
import { bookmarkIconDisplayModeSchema } from "~shared/config/appearance";
import { notifyError } from "~shared/lib/notify-error";

import { storage } from "#imports";

import { getEditSession, stageBookmarkSettings } from "../../../bookmark/model/edit-session";
import { compactLayout } from "../lib/layout";
export const MAX_FOLDER_HEIGHT_REM = 200;

export const folderViewSchema = z.enum(["list", "icons"]);
export const folderDisplaySchema = z
  .object({
    icon: bookmarkIconDisplayModeSchema,
    showTitle: z.boolean().catch(true),
    showUrl: z.boolean().catch(false),
    minHeight: z
      .number()
      .positive()
      .transform((height) => Math.min(height, MAX_FOLDER_HEIGHT_REM))
      .optional()
      .catch(undefined),
  })
  .transform(({ icon, showTitle, showUrl, minHeight }) => ({
    icon,
    showTitle: icon !== "original" || showTitle,
    ...(showUrl ? { showUrl } : {}),
    ...(minHeight === undefined ? {} : { minHeight }),
  }));
export type FolderDisplay = Omit<z.output<typeof folderDisplaySchema>, "showUrl"> & { showUrl?: boolean };
export type FolderView = z.output<typeof folderViewSchema>;
export type ColumnLayout = { columns: string[][]; widths: number[]; rows?: number[] };
const storedColumnSchema = z
  .array(z.string().nullable().catch(null))
  .transform((ids) => ids.filter((id) => id !== null));
const storedLayoutSchema = z.object({
  columns: z.array(storedColumnSchema.nullable().catch(null)),
  widths: z.array(z.number().positive().catch(1)).catch([]),
  rows: z.array(z.number().int().nonnegative().catch(0)).catch([]),
});
const storedSettingsSchema = z
  .object({
    folderViews: z.record(z.string(), folderViewSchema.nullable().catch(null)).catch({}),
    folderDisplays: z.record(z.string(), folderDisplaySchema.nullable().catch(null)).catch({}),
    layouts: z.record(z.string(), storedLayoutSchema.nullable().catch(null)).catch({}),
    defaultView: folderViewSchema.catch("list"),
    view: folderViewSchema.catch("list"),
    initialColumns: z.literal(2).nullable().catch(null),
    columns: z.literal(2).nullable().catch(null),
  })
  .catch(() => ({
    folderViews: {},
    folderDisplays: {},
    layouts: {},
    defaultView: "list" as const,
    view: "list" as const,
    initialColumns: null,
    columns: null,
  }));
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
  const input = storedSettingsSchema.parse(value);
  const folderViews: Record<string, FolderView> = {};
  const folderDisplays: Record<string, FolderDisplay> = {};
  const layouts: Record<string, ColumnLayout> = {};
  for (const [id, view] of Object.entries(input.folderViews)) {
    if (view) folderViews[id] = view;
  }
  for (const [id, display] of Object.entries(input.folderDisplays)) {
    if (display) folderDisplays[id] = display;
  }
  for (const [id, layout] of Object.entries(input.layouts)) {
    if (!layout) continue;
    const columns: string[][] = [];
    const widths: number[] = [];
    const rows: number[] = [];
    for (const [index, column] of layout.columns.entries()) {
      if (!column) continue;
      columns.push(column);
      widths.push(layout.widths[index] ?? 1);
      rows.push(layout.rows[index] ?? 0);
    }
    if (columns.length) layouts[id] = compactLayout(columns, widths, rows);
  }
  return {
    ...(Object.keys(folderDisplays).length ? { folderDisplays } : {}),
    folderViews,
    layouts,
    defaultView: input.defaultView === "icons" || input.view === "icons" ? "icons" : "list",
    initialColumns: input.initialColumns === 2 || input.columns === 2 ? 2 : 1,
  };
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
