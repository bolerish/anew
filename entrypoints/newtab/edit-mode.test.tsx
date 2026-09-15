import { render, fireEvent, waitFor } from "@testing-library/react";
import { test, expect, vi } from "vitest";

import App from "./App";
import { beginEditing, cancelEditing, saveEditing } from "./bookmark/model/edit-session";
const session = vi.hoisted(() => ({
  active: false,
  busy: false,
  failed: false,
  draft: null,
  canUndo: false,
  canRedo: false,
}));
vi.mock("./bookmark/model/edit-session", () => ({
  useEditSession: () => session,
  beginEditing: vi.fn<() => Promise<void>>(async () => {}),
  cancelEditing: vi.fn<() => void>(),
  saveEditing: vi.fn<() => Promise<void>>(async () => {}),
  undoEditing: vi.fn<() => void>(),
  redoEditing: vi.fn<() => void>(),
}));
vi.mock("~shared/lib/theme", () => ({ useThemeSync: () => {} }));
vi.mock("~newtab/date", () => ({ DateTime: () => null }));
vi.mock("./weather/ui/Weather", () => ({ Weather: () => null }));
vi.mock("./settings/ui/Setting", () => ({ Setting: () => null }));
vi.mock("~/entrypoints/newtab/bookmark", () => ({
  Bookmark: () => null,
  LocationPicker: () => null,
  useFolders: () => ({
    folders: [],
    locations: [],
    loadBookmarks: vi.fn<() => Promise<void>>(async () => {}),
    setSelectedLocation: vi.fn<() => void>(),
  }),
}));
vi.mock("~newtab/search", () => ({
  SearchBar: () => null,
  useSearch: () => ({ visibleFolders: [], results: [], query: "" }),
}));
test("E works on folder triggers, inputs retain typing and drafts block completion", async () => {
  const { rerender } = render(<App />);
  const input = document.createElement("input");
  document.body.append(input);
  fireEvent.keyDown(input, { key: "e", code: "KeyE" });
  fireEvent.keyDown(document.body, { key: "e", code: "KeyE", isComposing: true });
  expect(beginEditing).not.toHaveBeenCalled();
  const trigger = document.createElement("button");
  trigger.dataset.folderTrigger = "";
  document.body.append(trigger);
  fireEvent.keyDown(trigger, { key: "e", code: "KeyE" });
  expect(beginEditing).toHaveBeenCalledOnce();
  session.active = true;
  rerender(<App />);
  const draft = document.createElement("div");
  draft.dataset.bookmarkDraft = "";
  draft.append(input);
  document.body.append(draft);
  fireEvent.keyDown(document.body, { key: "Enter" });
  expect(saveEditing).not.toHaveBeenCalled();
  expect(document.activeElement).toBe(input);
  fireEvent.keyDown(document.body, { key: "Escape" });
  expect(cancelEditing).not.toHaveBeenCalled();
  draft.remove();
  fireEvent.keyDown(document.body, { key: "Enter" });
  await waitFor(() => expect(saveEditing).toHaveBeenCalledOnce());
  fireEvent.keyDown(document.body, { key: "Escape" });
  expect(cancelEditing).toHaveBeenCalledOnce();
  trigger.remove();
  session.active = false;
});
