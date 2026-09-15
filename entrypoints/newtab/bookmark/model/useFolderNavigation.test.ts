import { act, renderHook } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import { useFolderNavigation } from "./useFolderNavigation";

test("expires the highlight without clearing selection or moving focus, and restarts on another click", () => {
  vi.useFakeTimers();
  const folder = document.createElement("section");
  folder.id = "folder-work";
  folder.tabIndex = -1;
  folder.scrollIntoView = vi.fn<() => void>();
  document.body.append(folder);
  const { result, unmount } = renderHook(() => useFolderNavigation([]));
  act(() => result.current.focusFolder("work"));
  act(() => vi.advanceTimersByTime(1000));
  act(() => result.current.focusFolder("work"));
  act(() => vi.advanceTimersByTime(1499));
  expect(folder.dataset.contentsFocus).toBe("true");
  act(() => vi.advanceTimersByTime(1));
  expect(folder.dataset.contentsFocus).toBeUndefined();
  expect(result.current.active).toBe("work");
  expect(document.activeElement).toBe(folder);
  unmount();
  folder.remove();
  vi.useRealTimers();
});
