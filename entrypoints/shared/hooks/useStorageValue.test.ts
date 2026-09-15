import { act, renderHook } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { notifyError } from "~shared/lib/notify-error";

vi.mock("~shared/lib/notify-error", () => ({ notifyError: vi.fn<(error: unknown) => void>() }));

import { useStorageValue } from "./useStorageValue";
test("subscription beats stale reads and the latest value survives remount", async () => {
  const pending = Promise.withResolvers<number>();
  let receive!: (value: number) => void;
  const unwatch = vi.fn<() => void>();
  const storage = {
    getValue: () => pending.promise,
    watch: (callback: typeof receive) => {
      receive = callback;
      return unwatch;
    },
  };
  const { result, unmount } = renderHook(() => useStorageValue(storage, () => 10));
  act(() => receive(15));
  await act(async () => {
    pending.resolve(10);
    await pending.promise;
  });
  expect(result.current).toBe(15);
  unmount();
  expect(unwatch).toHaveBeenCalledOnce();
  expect(renderHook(() => useStorageValue(storage, () => 10)).result.current).toBe(15);
});

test("failed reads retain the fallback and report the error", async () => {
  const error = new Error("Storage unavailable");
  const storage = {
    getValue: async () => {
      throw error;
    },
    watch: () => () => {},
  };
  const { result } = renderHook(() => useStorageValue(storage, () => 10));
  await act(async () => {});
  expect(result.current).toBe(10);
  expect(notifyError).toHaveBeenCalledWith(error);
});
