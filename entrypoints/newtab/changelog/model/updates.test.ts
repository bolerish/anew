import { act, renderHook, waitFor } from "@testing-library/react";
import { expect, test } from "vitest";

import { LATEST_UPDATE_VERSION, lastReadUpdateStorage, markUpdatesRead, useUnreadUpdates } from "./updates";

test("reading updates clears both notices and persists across mounts", async () => {
  const first = renderHook(useUnreadUpdates);
  const second = renderHook(useUnreadUpdates);
  await waitFor(() => expect(first.result.current).toBe(true));
  await act(markUpdatesRead);
  await waitFor(() => {
    expect(first.result.current).toBe(false);
    expect(second.result.current).toBe(false);
  });
  expect(await lastReadUpdateStorage.getValue()).toBe(LATEST_UPDATE_VERSION);
  first.unmount();
  const reopened = renderHook(useUnreadUpdates);
  await waitFor(() => expect(reopened.result.current).toBe(false));
  await act(() => lastReadUpdateStorage.setValue("1.1.3"));
  await waitFor(() => expect(reopened.result.current).toBe(true));
});
