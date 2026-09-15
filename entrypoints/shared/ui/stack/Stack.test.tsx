import { act, renderHook } from "@testing-library/react";
import { useContext, type ReactNode } from "react";
import { expect, test, vi } from "vitest";

import { Stack, StackTransitionContext } from "./Stack";
test("transitions commit, clean up, and respect reduced motion", async () => {
  const start = vi.fn<(update: () => void) => Pick<ViewTransition, "ready" | "finished" | "skipTransition">>(
    (update) => {
      update();
      return { ready: Promise.resolve(), finished: Promise.resolve(), skipTransition: vi.fn<() => void>() };
    },
  );
  Object.defineProperty(document, "startViewTransition", { configurable: true, value: start });
  const wrapper = ({ children }: { children: ReactNode }) => <Stack>{children}</Stack>;
  const { result } = renderHook(() => useContext(StackTransitionContext), { wrapper });
  const commit = vi.fn<() => void>();
  await act(async () => result.current!(commit, "forward"));
  await act(async () => result.current!(commit, "back"));
  expect(start).toHaveBeenCalledTimes(2);
  expect(document.documentElement.dataset.stackTransition).toBeUndefined();
  document.documentElement.dataset.motionReduced = "true";
  await act(async () => result.current!(commit, "forward"));
  expect(start).toHaveBeenCalledTimes(2);
  expect(commit).toHaveBeenCalledTimes(3);
  delete document.documentElement.dataset.motionReduced;
});
test("a new navigation during an animation still commits", async () => {
  let finish!: () => void;
  const skip = vi.fn<() => void>(() => finish());
  let first = true;
  Object.defineProperty(document, "startViewTransition", {
    configurable: true,
    value: (update: () => void) => {
      update();
      const finished = first
        ? new Promise<void>((resolve) => {
            finish = resolve;
          })
        : Promise.resolve();
      first = false;
      return { ready: Promise.resolve(), finished, skipTransition: skip };
    },
  });
  const wrapper = ({ children }: { children: ReactNode }) => <Stack>{children}</Stack>;
  const { result } = renderHook(() => useContext(StackTransitionContext), { wrapper });
  const commit = vi.fn<() => void>();
  await act(async () => {
    const forward = result.current!(commit, "forward");
    const back = result.current!(commit, "back");
    await Promise.all([forward, back]);
  });
  expect(skip).toHaveBeenCalledOnce();
  expect(commit).toHaveBeenCalledTimes(2);
});
