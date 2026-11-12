import { act, renderHook } from "@testing-library/react";
import type { SubmitEvent } from "react";
import { expect, test, vi } from "vitest";

import { createItem } from "../api/create";
import { useAddForm } from "./useAddForm";

vi.mock("../api/create", () => ({ createItem: vi.fn<typeof createItem>() }));

test("blocks concurrent creates and retains the draft on failure for retry", async () => {
  const pending = Promise.withResolvers<"created" | "duplicate">();
  vi.mocked(createItem).mockReturnValueOnce(pending.promise).mockResolvedValueOnce("created");
  vi.spyOn(console, "error").mockImplementation(() => {});
  const onCreated = vi.fn<() => Promise<void>>(async () => {});
  const { result } = renderHook(() => useAddForm({ parentId: "1", onCreated }));
  act(() => {
    result.current.setTitle("Example");
    result.current.setUrl("https://example.com");
  });
  const event = { preventDefault: vi.fn<() => void>() } as unknown as SubmitEvent;
  let submission: Promise<void>;
  act(() => {
    submission = result.current.handleSubmit(event);
    void result.current.handleSubmit(event);
  });
  expect(createItem).toHaveBeenCalledTimes(1);
  expect(result.current.canSave).toBe(false);
  await act(async () => {
    pending.reject(new Error("Unavailable"));
    await submission;
  });
  expect(result.current.hasSaveError).toBe(true);
  expect(result.current.title).toBe("Example");
  expect(result.current.canSave).toBe(true);
  await act(() => result.current.handleSubmit(event));
  expect(createItem).toHaveBeenCalledTimes(2);
  expect(result.current.hasSaveError).toBe(false);
  expect(onCreated).toHaveBeenCalledTimes(1);
});

test("duplicate bookmarks show a toast and keep the form open", async () => {
  const { toast } = await import("@bolerish/ui/toast");
  const notification = vi.spyOn(toast, "add");
  vi.mocked(createItem).mockResolvedValueOnce("duplicate");
  const onCreated = vi.fn<() => Promise<void>>(async () => {});
  const { result } = renderHook(() => useAddForm({ parentId: "1", onCreated }));
  act(() => {
    result.current.toggleForm();
    result.current.setUrl("https://example.com");
  });
  const event = { preventDefault: vi.fn<() => void>() } as unknown as SubmitEvent;
  await act(() => result.current.handleSubmit(event));
  expect(notification).toHaveBeenCalledWith(expect.objectContaining({ id: "duplicate-bookmark" }));
  expect(result.current.isAddingBookmark).toBe(true);
  expect(result.current.hasSaveError).toBe(false);
  expect(onCreated).not.toHaveBeenCalled();
  notification.mockRestore();
});
