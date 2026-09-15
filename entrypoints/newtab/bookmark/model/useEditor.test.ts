import { act, renderHook, fireEvent, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import { updateItem } from "../api/update";
import { useEditor } from "./useEditor";
vi.mock("../api/update", () => ({
  updateItem: vi.fn<() => Promise<void>>(async () => {}),
  updateTitle: vi.fn<() => Promise<void>>(async () => {}),
}));
test("switching items replaces the draft; Enter saves only the editor and Escape closes it", async () => {
  const { result } = renderHook(() => useEditor());
  const item = { id: "one", parentId: "folder", title: "One", url: "https://example.com" };
  act(() => result.current.openInlineItemEditor(item));
  act(() => result.current.openInlineItemEditor({ ...item, id: "two", title: "Two" }));
  expect(result.current.inlineTitle).toBe("Two");
  const editor = document.createElement("div");
  editor.dataset.inlineBookmarkEditor = "";
  const input = document.createElement("input");
  editor.append(input);
  document.body.append(editor);
  fireEvent.keyDown(document.body, { key: "Enter" });
  expect(updateItem).not.toHaveBeenCalled();
  fireEvent.keyDown(input, { key: "Enter", isComposing: true });
  expect(updateItem).not.toHaveBeenCalled();
  fireEvent.keyDown(input, { key: "Enter" });
  await waitFor(() => expect(updateItem).toHaveBeenCalledOnce());
  act(() => result.current.openInlineItemEditor(item));
  fireEvent.keyDown(input, { key: "Escape" });
  expect(result.current.inlineEditingBookmark).toBeNull();
  editor.remove();
});

test("failed saving keeps the editor draft and exposes an inline error without a toast", async () => {
  const { toast } = await import("~shared/ui/toast");
  const notification = vi.spyOn(toast, "add");
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  const error = new Error("Storage unavailable");
  vi.mocked(updateItem).mockRejectedValueOnce(error);
  const { result } = renderHook(() => useEditor());
  act(() =>
    result.current.openInlineItemEditor({
      id: "failed",
      parentId: "folder",
      title: "Keep me",
      url: "https://example.com",
    }),
  );
  await act(() => result.current.updateCurrentInlineEditor());
  expect(result.current.inlineTitle).toBe("Keep me");
  expect(result.current.inlineEditingBookmark?.id).toBe("failed");
  expect(result.current.hasSaveError).toBe(true);
  expect(notification).not.toHaveBeenCalled();
  notification.mockRestore();
  log.mockRestore();
});
